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

module.exports.diffTags = (existList, newList) => {
  const diff = merge(existList, newList); // To get all tags and versions
  Object.entries(diff).forEach(([pkg, { versions, tags }]) => {
    Object.entries(tags).forEach(([tag, tagVer]) => {
      if (
        (existList[pkg] && existList[pkg].tags[tag] === tagVer) ||
        !versions.includes(tagVer)
      )
        delete tags[tag];
    });
    delete diff[pkg].versions;
    if (Object.keys(tags).length === 0) delete diff[pkg];
  });
  return diff;
};

module.exports.flat = l => {
  const list = [];
  Object.entries(l).forEach(([pkg, { versions }]) =>
    versions.forEach(ver => list.push(`${pkg}@${ver}`)),
  );
  return list.sort();
};
