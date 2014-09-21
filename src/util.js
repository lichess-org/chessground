var files = "abcdefgh".split('');
var ranks = _.range(1, 9);

function pos2key(pos) {
  return files[pos[0] - 1] + pos[1];
}

function classSet(classNames) {
  return Object.keys(classNames).filter(function(className) {
    return classNames[className];
  }).join(' ');
}

function pp(x) {
  console.log(x);
  return x;
}

module.exports = {
  files: files,
  ranks: ranks,
  pos2key: pos2key,
  classSet: classSet,
  pp: pp
};
