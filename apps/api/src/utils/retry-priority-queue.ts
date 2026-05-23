/** Retry priority levels. Lower numeric values run first. */
export enum RetryPriority {
  CRITICAL = 0,
  HIGH = 1,
  NORMAL = 2,
  LOW = 3,
}

/** Retry job stored by the priority queue. */
export type RetryJob = {
  id: string;
  priority: RetryPriority;
  fn: () => Promise<unknown>;
  maxAttempts: number;
  attemptCount: number;
  lastError?: Error;
  createdAt: number;
  nextRetryAt: number;
};

type HeapEntry = RetryJob & {
  sequence: number;
};

/**
 * Binary min-heap for retry scheduling.
 */
export class RetryPriorityQueue {
  private readonly heap: HeapEntry[] = [];

  private sequence = 0;

  enqueue(job: RetryJob): void {
    this.heap.push({ ...job, sequence: this.sequence });
    this.sequence += 1;
    this.bubbleUp(this.heap.length - 1);
  }

  dequeue(): RetryJob | null {
    if (this.heap.length === 0) {
      return null;
    }

    const top = this.heap[0];
    const last = this.heap.pop();

    if (this.heap.length > 0 && last) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }

    return top ? this.stripEntry(top) : null;
  }

  peek(): RetryJob | null {
    const top = this.heap[0];
    return top ? this.stripEntry(top) : null;
  }

  size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private stripEntry(entry: HeapEntry): RetryJob {
    const { sequence: _sequence, ...job } = entry;
    return job;
  }

  private compare(left: HeapEntry, right: HeapEntry): number {
    if (left.priority !== right.priority) {
      return left.priority - right.priority;
    }

    return left.sequence - right.sequence;
  }

  private bubbleUp(index: number): void {
    let currentIndex = index;

    while (currentIndex > 0) {
      const parentIndex = Math.floor((currentIndex - 1) / 2);
      const current = this.heap[currentIndex];
      const parent = this.heap[parentIndex];

      if (!current || !parent || this.compare(current, parent) >= 0) {
        break;
      }

      this.heap[currentIndex] = parent;
      this.heap[parentIndex] = current;
      currentIndex = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    let currentIndex = index;

    while (true) {
      const leftIndex = currentIndex * 2 + 1;
      const rightIndex = currentIndex * 2 + 2;
      let smallest = currentIndex;

      const current = this.heap[currentIndex];
      const left = this.heap[leftIndex];
      const right = this.heap[rightIndex];

      if (left && current && this.compare(left, current) < 0) {
        smallest = leftIndex;
      }

      const smallestNode = this.heap[smallest];
      if (right && smallestNode && this.compare(right, smallestNode) < 0) {
        smallest = rightIndex;
      }

      if (smallest === currentIndex) {
        break;
      }

      const swap = this.heap[currentIndex];
      const smallestEntry = this.heap[smallest];
      if (!swap || !smallestEntry) {
        break;
      }

      this.heap[currentIndex] = smallestEntry;
      this.heap[smallest] = swap;
      currentIndex = smallest;
    }
  }
}
