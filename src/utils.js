
// util

var util = {};

util.files = "abcdefgh".split('');
util.ranks = _.range(1, 9);
util.classSet = function(classNames) {
  return Object.keys(classNames).filter(function(className) {
    return classNames[className];
  }).join(' ');
};

util.pp = function(x) {
  console.log(x);
  return x;
};

module.exports = util;
