var files = "abcdefgh".split('');
var ranks = _.range(1, 9);

function pos2key(pos) {
  return files[pos[0] - 1] + pos[1];
}
function key2pos(pos) {
  return [(files.indexOf(pos[0]) + 1), parseInt(pos[1])];
}

function invertKey(key) {
  return files[7 - files.indexOf(key[0])] + (9 - parseInt(key[1]));
}

var allPos = (function() {
  var ps = [];
  ranks.forEach(function(y) {
    ranks.forEach(function(x) {
      ps.push([x, y]);
    });
  });
  return ps;
})();
var allKeys = allPos.map(pos2key);

function classSet(classNames) {
  return Object.keys(classNames).filter(function(className) {
    return classNames[className];
  }).join(' ');
}

function opposite(color) {
  return color === 'white' ? 'black' : 'white';
}

function translate(pos) {
  return 'translate3d(' + pos[0] + 'px,' + pos[1] + 'px,0)';
}

function pp(x) {
  console.log(x);
  return x;
}

module.exports = {
  files: files,
  ranks: ranks,
  allPos: allPos,
  allKeys: allKeys,
  pos2key: pos2key,
  key2pos: key2pos,
  classSet: classSet,
  opposite: opposite,
  translate: translate,
  pp: pp
};
