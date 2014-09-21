// {a1: {role: 'rook', color: 'white'}, ...}
Pieces = function(data) {
  this.all = data;
  this.get = function(key) {
    return data[key];
  }
  this.remove = function(key) {
    delete data[key];
  }
  this.put = function(key, piece) {
    data[key] = piece;
  }
  this.move = function(orig, dest) {
    this.put(dest, this.get(orig));
    this.remove(orig);
  };
};

module.exports = {
  Pieces: Pieces
};
