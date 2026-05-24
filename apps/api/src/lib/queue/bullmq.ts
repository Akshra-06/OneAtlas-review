// =============================================================================
// apps/api/src/lib/queue/bullmq.ts
//
// Node-only BullMQ helpers for background workers.
// Do not import this module from edge route handlers.
// =============================================================================

import { Redis } from "@upstash/redis";
import {
  Queue,
  Worker,
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
