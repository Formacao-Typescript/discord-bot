export const runWithTimeout = <T>(fn: () => Promise<T>, timeout: number, rejectOnTimeout = false) =>
  Promise.race([
    fn(),
    new Promise<void>((resolve, reject) =>
      setTimeout(() => {
        if (rejectOnTimeout) return reject();
        resolve();
      }, timeout)
    ),
  ]);
