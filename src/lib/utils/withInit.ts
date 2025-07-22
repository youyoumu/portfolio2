export function withInit<T>() {
  return class {
    constructor(args: T) {
      Object.assign(this, args);
    }
  } as {
    new (args: T): T;
  };
}
