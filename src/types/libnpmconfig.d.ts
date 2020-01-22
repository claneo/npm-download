declare module 'libnpmconfig' {
  export const read: (
    _builtin?: any,
  ) => Record<string, string> & {
    toJSON: () => Record<string, string>;
  };
}
