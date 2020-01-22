declare module 'npm-pick-manifest' {
  import { Packument, Manifest } from 'pacote';
  const pickManifest: (
    packument: Packument,
    spec?: string | null,
  ) => Manifest & {
    dist: { integrity?: string; shasum?: string; tarball: string };
  };
  export default pickManifest;
}
