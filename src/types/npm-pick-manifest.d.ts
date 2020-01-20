declare module 'npm-pick-manifest' {
  const pickManifest: (
    packument: import('pacote').Packument,
    spec?: string | null,
  ) => import('pacote').Manifest & {
    dist: { integrity?: string; shasum?: string };
  };
  export default pickManifest;
}
