const configUtil = require('./config');
const rwFile = require('./rwFile');

const merge = (a, b) => {
  a = JSON.parse(JSON.stringify(a));
  Object.entries(b).forEach(([package, { versions = [], tags = {} }]) => {
    if (!a[package])
      a[package] = { versions: [...versions], tags: { ...tags } };
    else {
      versions.forEach(version => {
        if (!a[package].versions.includes(version))
          a[package].versions.push(version);
      });
      Object.assign(a[package].tags, tags);
    }
  });
  return a;
};
module.exports.merge = merge;

const addVersion = (l, pkg, version) => {
  const r = merge(l, {
    [pkg]: { versions: Array.isArray(version) ? version : [version] },
  });
  Object.assign(l, r);
  return r;
};
module.exports.addVersion = addVersion;

const addTag = (l, pkg, tag, version) => {
  let tags = tag;
  if (version !== undefined) {
    tags = { [tag]: version };
  }
  const r = merge(l, { [pkg]: { tags } });
  Object.assign(l, r);
  return r;
};
module.exports.addTag = addTag;

module.exports.diffVersions = (existList, newList) => {
  const packages = [];
  Object.entries(newList).forEach(([package, { versions }]) => {
    versions.forEach(version => {
      if (!existList[package] || !existList[package].versions.includes(version))
        packages.push(package + '@' + version);
    });
  });
  return packages;
};

module.exports.saveDiffFile = newList => {
  const existList = configUtil.get().packages;
  const prevDiff = rwFile.get('./diff.json') || {};
  const existAll = merge(existList, prevDiff);
  newList = merge(newList, {}); // deep copy
  Object.entries(newList).forEach(([pkg, pkgV]) => {
    const existVersions = existAll[pkg] ? existAll[pkg].versions : [];
    pkgV.versions = pkgV.versions.filter(ver => !existVersions.includes(ver));
    const allVersions = [...existVersions, ...pkgV.versions];
    Object.entries(pkgV.tags).forEach(([tag, ver]) => {
      if (tag !== 'latest') {
        if (
          !allVersions.includes(ver) ||
          (existAll[pkg] && existAll[pkg].tags[tag] === ver)
        )
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

module.exports.flat = l => {
  const list = [];
  Object.entries(l).forEach(([pkg, { versions }]) =>
    versions.forEach(ver => list.push(`${pkg}@${ver}`))
  );
  return list.sort();
};
