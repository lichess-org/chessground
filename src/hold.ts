let startAt: Date | undefined;

export function start() {
  startAt = new Date();
}

export function cancel() {
  startAt = undefined;
};

export function stop(): number {
  if (!startAt) return 0;
  const time = new Date().getTime() - startAt.getTime();
  startAt = undefined;
  return time;
};
