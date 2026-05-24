// =============================================================================
// apps/api/src/lib/queue/client.ts
//
// Row 17 — Queue System (Background Jobs)
//
// Upstash Redis-backed queue using the @upstash/redis REST client.
// Serverless-safe: no persistent connections, no BullMQ daemon.
//
// Architecture:
//   - Jobs are pushed to a Redis LIST (LPUSH) — one list per job type
//   - Workers pop jobs with BRPOPLPUSH (atomic, safe for retries)
//   - Failed jobs land in a dead-letter list after maxRetries
//   - A lightweight retry counter lives as a Redis HASH alongside each job
//
// Lists used:
//   queue:deploy        — deployment jobs
//   queue:ai            — AI generation jobs
//   queue:deploy:dead   — failed deploy jobs
//   queue:ai:dead       — failed AI jobs
// =============================================================================

import { Redis } from "@upstash/redis";
import {
  Queue,
  Worker,
  type BackoffStrategy,
  type Job as BullJob,
  type Processor,
  type QueueOptions,
  type WorkerOptions,
} from "bullmq";

// ── Redis client (singleton) ──────────────────────────────────────────────────

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (!_redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error(
        "Missing Upstash env vars: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN"
      );
    }

    _redis = new Redis({ url, token });
  }
  return _redis;
}

// ── BullMQ helpers ───────────────────────────────────────────────────────────

export interface QueueJobRecord {
  id: string;
  type: string;
  createdAt: string;
  attempts: number;
  maxRetries: number;
}

export type DeadLetterJobRecord<T extends QueueJobRecord> = T & {
  failedAt: string;
  lastError: string;
};

const BULLMQ_PREFIX = "oneatlas";
const BULLMQ_RETRY_DELAYS_MS = [1_000, 5_000, 15_000] as const;

const bullQueues = new Map<string, Queue<unknown, unknown, string>>();
const bullWorkers = new Map<string, Worker<unknown, unknown, string>>();

function getBullConnection(): QueueOptions["connection"] | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  const parsed = new URL(url);
  const host = parsed.hostname;
  const port = parsed.port ? Number(parsed.port) : 6_379;

  return {
    host,
    port,
    username: parsed.username || "default",
    password: token,
    tls: { servername: host },
  } satisfies QueueOptions["connection"];
}

function getBullQueueOptions(
  overrides: Partial<QueueOptions> = {}
): QueueOptions | null {
  const connection = getBullConnection();

  if (!connection) {
    return null;
  }

  return {
    connection,
    prefix: BULLMQ_PREFIX,
    defaultJobOptions: {
      attempts: 3,
      removeOnComplete: true,
      removeOnFail: false,
      backoff: {
        type: "custom",
        delay: BULLMQ_RETRY_DELAYS_MS[0],
      },
    },
    ...overrides,
  } satisfies QueueOptions;
}

function getBullWorkerOptions(
  concurrency: number,
  overrides: Partial<WorkerOptions> = {}
): WorkerOptions | null {
  const connection = getBullConnection();

  if (!connection) {
    return null;
  }

  return {
    connection,
    prefix: BULLMQ_PREFIX,
    concurrency,
    settings: {
      backoffStrategy: bullmqBackoffStrategy,
    },
    ...overrides,
  } satisfies WorkerOptions;
}

export function bullmqBackoffStrategy(attemptsMade: number): number {
  const index = Math.max(
    0,
    Math.min(attemptsMade - 1, BULLMQ_RETRY_DELAYS_MS.length - 1)
  );
  const delay = BULLMQ_RETRY_DELAYS_MS[index] ?? BULLMQ_RETRY_DELAYS_MS[BULLMQ_RETRY_DELAYS_MS.length - 1];
  return delay ?? 15_000;
}

export function getQueue<TData extends QueueJobRecord = QueueJobRecord>(
  queueName: string,
  overrides: Partial<QueueOptions> = {}
): Queue<TData, unknown, string> | null {
  const options = getBullQueueOptions(overrides);
  if (!options) {
    return null;
  }

  const existing = bullQueues.get(queueName);
  if (existing) {
    return existing as Queue<TData, unknown, string>;
  }

  const queue = new Queue<TData, unknown, string>(queueName, options);
  bullQueues.set(queueName, queue as Queue<unknown, unknown, string>);
  return queue;
}

export function getWorker<
  TData extends QueueJobRecord = QueueJobRecord,
  TResult = void,
>(
  queueName: string,
  processor: Processor<TData, TResult, string>,
  overrides: Partial<WorkerOptions> & { concurrency?: number } = {}
): Worker<TData, TResult, string> | null {
  const options = getBullWorkerOptions(overrides.concurrency ?? 1, overrides);
  if (!options) {
    return null;
  }

  const existing = bullWorkers.get(queueName);
  if (existing) {
    return existing as Worker<TData, TResult, string>;
  }

  const worker = new Worker<TData, TResult, string>(queueName, processor, options);

  worker.on("failed", async (job, error) => {
    if (!job) {
      return;
    }

    const maxAttempts = job.opts.attempts ?? 1;
    if (job.attemptsMade < maxAttempts) {
      return;
    }

    const failedQueue = getQueue<DeadLetterJobRecord<TData>>(`${queueName}:failed`);
    if (!failedQueue) {
      return;
    }

    const failedJob: DeadLetterJobRecord<TData> = {
      ...job.data,
      attempts: job.attemptsMade,
      failedAt: new Date().toISOString(),
      lastError: error?.message ?? "Unknown error",
    };

    const failedQueueWriter = failedQueue as unknown as {
      add(
        name: string,
        data: DeadLetterJobRecord<TData>,
        options?: {
          jobId?: string;
          removeOnComplete?: boolean;
          removeOnFail?: boolean;
        }
      ): Promise<unknown>;
    };

    await failedQueueWriter.add("dead-letter", failedJob, {
      jobId: `${job.id}:failed`,
      removeOnComplete: true,
      removeOnFail: false,
    });
  });

  bullWorkers.set(queueName, worker as Worker<unknown, unknown, string>);
  return worker;
}

// ── Job types ─────────────────────────────────────────────────────────────────

export type JobType = "deploy" | "ai_generation";

export interface BaseJob {
  id: string;
  type: JobType;
  createdAt: string;
  attempts: number;
  maxRetries: number;
}

export interface DeployJob extends BaseJob {
  type: "deploy";
  payload: {
    deploymentId: string;
    triggeredByUserId: string;
  };
}

export interface AiGenerationJob extends BaseJob {
  type: "ai_generation";
  payload: {
    projectId: string;
    orgId: string;
    prompt: string;
    projectType: string;
    triggeredByUserId: string;
  };
}

export type Job = DeployJob | AiGenerationJob;

// ── Queue key helpers ─────────────────────────────────────────────────────────

const QUEUE_PREFIX = "queue";
const PROCESSING_SUFFIX = ":processing";
const DEAD_SUFFIX = ":dead";
const META_PREFIX = "job:meta:";

export function queueKey(type: JobType): string {
  return `${QUEUE_PREFIX}:${type}`;
}

export function processingKey(type: JobType): string {
  return `${QUEUE_PREFIX}:${type}${PROCESSING_SUFFIX}`;
}

export function deadLetterKey(type: JobType): string {
  return `${QUEUE_PREFIX}:${type}${DEAD_SUFFIX}`;
}

export function jobMetaKey(jobId: string): string {
  return `${META_PREFIX}${jobId}`;
}

// ── Enqueue ───────────────────────────────────────────────────────────────────

/**
 * Push a job onto the appropriate queue.
 * Returns the job ID.
 */
export async function enqueue<T extends Job>(
  job: Omit<T, "id" | "createdAt" | "attempts"> & { id?: string }
): Promise<string> {
  const redis = getRedis();

  const fullJob: Job = {
    ...job,
    id: job.id ?? crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    attempts: 0,
  } as Job;

  const key = queueKey(fullJob.type);
  const serialized = JSON.stringify(fullJob);

  // LPUSH — new jobs go to the left; workers pop from the right (FIFO)
  await redis.lpush(key, serialized);

  // Store metadata for status lookups
  await redis.hset(jobMetaKey(fullJob.id), {
    id: fullJob.id,
    type: fullJob.type,
    status: "queued",
    createdAt: fullJob.createdAt,
    attempts: "0",
    maxRetries: String(fullJob.maxRetries),
  });

  return fullJob.id;
}

// ── Dequeue (atomic pop → processing list) ────────────────────────────────────

/**
 * Atomically move a job from the queue to the processing list.
 * Returns null if the queue is empty.
 *
 * Uses RPOPLPUSH for safe at-least-once delivery:
 * if the worker crashes, the job stays in the processing list
 * and can be recovered by a sweep job.
 */
export async function dequeue(type: JobType): Promise<Job | null> {
  const redis = getRedis();
  const from = queueKey(type);
  const to = processingKey(type);

  // LMOVE: pop from right of source, push to left of dest (atomic)
  const raw = await redis.lmove(from, to, "right", "left");
  if (!raw) return null;

  const job = (typeof raw === "string" ? JSON.parse(raw) : raw) as Job;

  // Update metadata
  await redis.hset(jobMetaKey(job.id), {
    status: "processing",
    startedAt: new Date().toISOString(),
    attempts: String(job.attempts + 1),
  });

  return { ...job, attempts: job.attempts + 1 };
}

// ── Acknowledge (remove from processing list) ─────────────────────────────────

export async function ack(type: JobType, job: Job): Promise<void> {
  const redis = getRedis();
  const serialized = JSON.stringify({ ...job, attempts: job.attempts });

  // Remove from processing list
  await redis.lrem(processingKey(type), 1, serialized);

  // Mark as done in metadata
  await redis.hset(jobMetaKey(job.id), {
    status: "completed",
    completedAt: new Date().toISOString(),
  });

  // Expire metadata after 24h
  await redis.expire(jobMetaKey(job.id), 86400);
}

// ── Delayed retry queue key ───────────────────────────────────────────────────

export function delayedKey(type: JobType): string {
  return `${QUEUE_PREFIX}:${type}:delayed`;
}

// ── Promote due delayed jobs back to main queue ───────────────────────────────

/**
 * Call this at the start of each worker tick.
 * Moves any delayed jobs whose score (= run-at timestamp) <= now
 * back into the main queue so they get picked up.
 */
export async function promoteDelayedJobs(type: JobType): Promise<number> {
  const redis = getRedis();
  const now = Date.now();

  // ZRANGEBYSCORE: get all members with score <= now
  const due = await redis.zrange(delayedKey(type), 0, now, { byScore: true });
  if (!due || due.length === 0) return 0;

  for (const raw of due) {
    const serialized = typeof raw === "string" ? raw : JSON.stringify(raw);
    await redis.lpush(queueKey(type), serialized);
    await redis.zrem(delayedKey(type), raw as string);
  }

  return due.length;
}

// ── Fail / retry / dead-letter ────────────────────────────────────────────────

// Backoff: 30s * 2^attempt — capped at 10 min
function backoffMs(attempt: number): number {
  return Math.min(30_000 * Math.pow(2, attempt - 1), 600_000);
}

export async function failJob(
  type: JobType,
  job: Job,
  errorMessage: string
): Promise<"retried" | "dead"> {
  const redis = getRedis();
  const serialized = JSON.stringify(job);

  // Remove from processing list
  await redis.lrem(processingKey(type), 1, serialized);

  if (job.attempts < job.maxRetries) {
    // Re-enqueue into delayed sorted set with score = runAt timestamp
    const delay = backoffMs(job.attempts);
    const runAt = Date.now() + delay;
    const retried = { ...job, attempts: job.attempts };

    // ZADD delayedKey score member — score is the Unix ms timestamp to run at
    await redis.zadd(delayedKey(type), {
      score: runAt,
      member: JSON.stringify(retried),
    });

    await redis.hset(jobMetaKey(job.id), {
      status: "retrying",
      lastError: errorMessage,
      attempts: String(job.attempts),
      retryAt: new Date(runAt).toISOString(),
      retryDelayMs: String(delay),
    });

    return "retried";
  }

  // Dead-letter
  const deadJob = {
    ...job,
    failedAt: new Date().toISOString(),
    lastError: errorMessage,
  };

  await redis.lpush(deadLetterKey(type), JSON.stringify(deadJob));

  await redis.hset(jobMetaKey(job.id), {
    status: "dead",
    lastError: errorMessage,
    deadAt: new Date().toISOString(),
  });

  // Keep dead job meta for 7 days
  await redis.expire(jobMetaKey(job.id), 7 * 86400);

  return "dead";
}

// ── Job status lookup ─────────────────────────────────────────────────────────

export interface JobStatus {
  id: string;
  type: string;
  status: "queued" | "processing" | "completed" | "retrying" | "dead" | "unknown";
  attempts: number;
  maxRetries: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  deadAt?: string;
  lastError?: string;
}

export async function getJobStatus(jobId: string): Promise<JobStatus | null> {
  const redis = getRedis();
  const meta = await redis.hgetall(jobMetaKey(jobId));

  if (!meta || Object.keys(meta).length === 0) return null;

  return {
    id: meta.id as string,
    type: meta.type as string,
    status: (meta.status as JobStatus["status"]) ?? "unknown",
    attempts: Number(meta.attempts ?? 0),
    maxRetries: Number(meta.maxRetries ?? 3),
    createdAt: meta.createdAt as string,
    startedAt: meta.startedAt as string | undefined,
    completedAt: meta.completedAt as string | undefined,
    deadAt: meta.deadAt as string | undefined,
    lastError: meta.lastError as string | undefined,
  };
}

// ── Queue depth (monitoring) ──────────────────────────────────────────────────

export interface QueueStats {
  type: JobType;
  queued: number;
  processing: number;
  dead: number;
}

export async function getQueueStats(type: JobType): Promise<QueueStats> {
  const redis = getRedis();

  const [queued, processing, dead] = await Promise.all([
    redis.llen(queueKey(type)),
    redis.llen(processingKey(type)),
    redis.llen(deadLetterKey(type)),
  ]);

  return { type, queued, processing, dead };
}
