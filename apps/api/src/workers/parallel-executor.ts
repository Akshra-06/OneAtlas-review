// =============================================================================
// apps/api/src/workers/parallel-executor.ts
// Promise-based concurrency helpers for worker orchestration.
// =============================================================================

/** Error thrown when a task exceeds its allowed execution time. */
export class TimeoutError extends Error {
  /**
   * Create a timeout error.
   * @param timeoutMs - Timeout duration in milliseconds.
   */
  constructor(timeoutMs: number) {
    super(`Task timed out after ${timeoutMs}ms`);
    this.name = "TimeoutError";
  }
}

/**
 * Execute async tasks with a sliding concurrency window.
 * @param tasks - Task functions to execute.
 * @param concurrency - Maximum number of tasks to run at once.
 */
export async function executeInParallel<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number
): Promise<Array<PromiseSettledResult<T>>> {
  if (tasks.length === 0) {
    return [];
  }

  const limit = Math.max(1, Math.floor(concurrency));
  const results: Array<PromiseSettledResult<T>> = new Array(tasks.length);
  let nextIndex = 0;
  let active = 0;

  return await new Promise<Array<PromiseSettledResult<T>>>((resolve) => {
    const launchNext = (): void => {
      while (active < limit && nextIndex < tasks.length) {
        const currentIndex = nextIndex;
        const task = tasks[currentIndex];
        nextIndex += 1;
        active += 1;

        if (!task) {
          active -= 1;
          continue;
        }

        void Promise.resolve()
          .then(() => task())
          .then(
            (value) => {
              results[currentIndex] = { status: "fulfilled", value };
            },
            (reason: unknown) => {
              results[currentIndex] = { status: "rejected", reason };
            }
          )
          .finally(() => {
            active -= 1;

            if (results.filter(Boolean).length === tasks.length) {
              resolve(results);
              return;
            }

            launchNext();
          });
      }
    };

    launchNext();
  });
}

/**
 * Execute a single async task with a timeout.
 * @param task - Task to execute.
 * @param timeoutMs - Maximum time to allow execution.
 */
export async function executeWithTimeout<T>(
  task: () => Promise<T>,
  timeoutMs: number
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  try {
    return await Promise.race<T>([
      task(),
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new TimeoutError(timeoutMs));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}
