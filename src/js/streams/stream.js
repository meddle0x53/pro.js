Pro.Stream = function (source, transforms) {
  this.transforms = transforms ? transforms : [];
  this.sources = [];

  Pro.Observable.call(this);

  var stream = this;
  this.listener = function (event) {
    stream.trigger(event);
  }

  if (source) {
    this.addSource(source);
  }
};

Pro.Stream.prototype = Object.create(Pro.Observable.prototype);
Pro.Stream.prototype.constructor = Pro.Stream;

Pro.Stream.prototype.makeEvent = function (source) {
  return source;
};

Pro.Stream.prototype.trigger = function (event) {
  var i, tr = this.transforms, ln = tr.length;

  for (i = 0; i < ln; i++) {
    event = tr[i].call(this, event);
  }

  this.update(event);
};

Pro.Stream.prototype.addSource = function (source) {
  this.sources.push(source);
  source.addListener(this.listener);
};

// TODO Remove object from array!
Pro.Stream.prototype.removeSource = function (source) {
  var i, s = this.sources, sln = s.length;
  for (i = 0; i < sln; i++) {
    if (s[i] === source) {
      s.splice(i, 1);
      break;
    }
  }
  source.removeListener(this.listener);
};

Pro.Stream.prototype.map = function (f) {
  return new Pro.Stream(this, [f]);
};
