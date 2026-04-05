export default function (fn: Function, delay: number) {
  let timer: NodeJS.Timeout | null;

  return function (...args: any[]) {
    if (timer) clearTimeout(timer);
    return new Promise((resolve) => {
      timer = setTimeout(() => {
        Promise.resolve(fn(...args)).then(resolve);
      }, delay);
    });
  };
}
