/// <reference types="node" />

declare module 'libnpmpublish' {
  import { FetchOptions } from 'npm-registry-fetch';
  export const publish: (
    pkgJson: any,
    tarData: NodeJS.ReadableStream | Buffer,
    opts?: FetchOptions,
  ) => void;
}
