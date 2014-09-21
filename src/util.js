var files = "abcdefgh".split('');
var ranks = _.range(1, 9);

var allPos = (function() {
  var ps = [];
  ranks.forEach(function(y) {
    ranks.forEach(function(x) {
      ps.push([x, y]);
    });
  });
  return ps;
})();

function pos2key(pos) {
  return files[pos[0] - 1] + pos[1];
}

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
  pos2key: pos2key,
  classSet: classSet,
  opposite: opposite,
  translate: translate,
  pp: pp
};
