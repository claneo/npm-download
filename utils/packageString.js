module.exports = str => {
  let splited = str.split('@');
  let name = '';
  let version = '';
  if (splited.length === 2) {
    [name, version] = splited;
  } else {
    name = '@' + splited[1];
    version = splited[2];
  }
  return { name, version };
};
