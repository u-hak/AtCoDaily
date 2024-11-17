export type TupleFromInterface<T, K extends Array<keyof T>> = {
  [I in keyof K]: K[I] extends keyof T ? T[K[I]] : never;
};
