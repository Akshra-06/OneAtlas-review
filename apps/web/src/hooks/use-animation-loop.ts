"use client";
import { useEffect } from "react";

type Task = (frame: number) => void;
const tasks: Set<Task> = new Set();
let started = false;
let frame = 0;

function loop() {
  frame++;
  tasks.forEach((t) => t(frame));
  requestAnimationFrame(loop);
}

function start() {
  if (started) return;
  started = true;
  requestAnimationFrame(loop);
}

export function useAnimationLoop(task: Task | null) {
  useEffect(() => {
    if (!task) return;
    tasks.add(task);
    start();
    return () => {
      tasks.delete(task);
    };
  }, [task]);
}
