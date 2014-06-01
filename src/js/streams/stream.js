Pro.Stream = function (source, transforms) {
  this.transforms = transforms ? transforms : [];
  this.sources = [];

  Pro.Observable.call(this);

  var stream = this;
  this.listener = function (event) {
    stream.trigger(event, true);
  }

  if (source) {
    this.addSource(source);
  }
};

Pro.Stream.BadValue = '<><>BAD_VAL<><>';

Pro.Stream.prototype = Object.create(Pro.Observable.prototype);
Pro.Stream.prototype.constructor = Pro.Stream;

Pro.Stream.prototype.makeEvent = function (source) {
  return source;
};

Pro.Stream.prototype.trigger = function (event, useTransformations) {
  var i, tr = this.transforms, ln = tr.length;

  if (useTransformations) {
    for (i = 0; i < ln; i++) {
      event = tr[i].call(this, event);
    }
  }

  if (event === Pro.Stream.BadValue) {
    return false;
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

Pro.Stream.prototype.filter = function (f) {
  var _this = this, filter;

  filter = function (val) {
    if (f.call(_this, val)) {
      return val;
    }
    return Pro.Stream.BadValue;
  };
  return new Pro.Stream(this, [filter]);
};

Pro.Stream.prototype.accumulate = function (initVal, f) {
  var _this = this, accumulator, val = initVal;

  accumulator = function (newVal) {
    val = f.call(_this, val, newVal)
    return val;
  };

  return new Pro.Stream(this, [accumulator]);
};
