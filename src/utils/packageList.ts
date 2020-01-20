import * as configUtil from './config';
import * as rwFile from './rwFile';

export type PackageList = Record<
  string,
  { versions: string[]; tags: Record<string, string> }
>;

export const merge = (a: PackageList, b: PackageList) => {
  a = JSON.parse(JSON.stringify(a));
  Object.entries(b).forEach(([pkg, { versions = [], tags = {} }]) => {
    if (!a[pkg]) a[pkg] = { versions: [...versions], tags: { ...tags } };
    else {
      versions.forEach(version => {
        if (!a[pkg].versions.includes(version)) a[pkg].versions.push(version);
      });
      Object.assign(a[pkg].tags, tags);
    }
  });
  return a;
};

export const addVersion = (
  l: PackageList,
  pkg: string,
  version: string | string[],
) => {
  const r = merge(l, {
    [pkg]: { versions: Array.isArray(version) ? version : [version], tags: {} },
  });
  Object.assign(l, r);
  return r;
};

export function addTag(
  l: PackageList,
  pkg: string,
  tags: Record<string, string>,
): PackageList;
export function addTag(
  l: PackageList,
  pkg: string,
  tag: string,
  version: string,
): PackageList;
export function addTag(
  l: PackageList,
  pkg: string,
  tag: string | Record<string, string>,
  version?: string,
): PackageList {
  let tags: Record<string, string> = {};
  if (version !== undefined && typeof tag === 'string') {
    tags = { [tag]: version };
  } else if (typeof tag === 'object') tags = tag;
  const r = merge(l, { [pkg]: { tags, versions: [] } });
  Object.assign(l, r);
  return r;
}

export const diffVersions = (existList: PackageList, newList: PackageList) => {
  const packages: string[] = [];
  Object.entries(newList).forEach(([pkg, { versions }]) => {
    versions.forEach(version => {
      if (!existList[pkg] || !existList[pkg].versions.includes(version))
        packages.push(pkg + '@' + version);
    });
  });
  return packages;
};

export const saveDiffFile = (newList: PackageList) => {
  const existList = configUtil.get().packages;
  const prevDiff = rwFile.get('./diff.json') || {};
  const existAll = merge(existList, prevDiff);
  newList = merge(newList, {}); // deep copy
  Object.entries(newList).forEach(([pkg, pkgV]) => {
    const existVersions = existAll[pkg] ? existAll[pkg].versions : [];
    pkgV.versions = pkgV.versions.filter(ver => !existVersions.includes(ver));
    const allVersions = [...existVersions, ...pkgV.versions];
    Object.entries(pkgV.tags).forEach(([tag, ver]) => {
      if (!allVersions.includes(ver)) delete pkgV.tags[tag];
      else if (tag !== 'latest') {
        if (existAll[pkg] && existAll[pkg].tags[tag] === ver)
          delete pkgV.tags[tag];
      } else {
        if (pkgV.versions.length === 0) delete pkgV.tags[tag];
      }
    });
    if (pkgV.versions.length === 0 && Object.values(pkgV.tags).length === 0)
      delete newList[pkg];
  });
  const diff = merge(prevDiff, newList);
  rwFile.set('./diff.json', diff);
  configUtil.set({ packages: merge(existList, diff) });
};

export const flat = (l: PackageList) => {
  const list: string[] = [];
  Object.entries(l).forEach(([pkg, { versions }]) =>
    versions.forEach(ver => list.push(`${pkg}@${ver}`)),
  );
  return list.sort();
};
