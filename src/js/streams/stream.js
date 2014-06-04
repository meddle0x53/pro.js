Pro.Stream = function (source, transforms) {
  this.transforms = transforms ? transforms : [];

  Pro.Observable.call(this);

  if (source) {
    this.in(source);
  }
};

Pro.Stream.BadValue = {};

Pro.Stream.prototype = Object.create(Pro.Observable.prototype);
Pro.Stream.prototype.constructor = Pro.Stream;

Pro.Stream.prototype.makeEvent = function (source) {
  return source;
};

Pro.Stream.prototype.makeListener = function (source) {
  if (!this.listener) {
    var stream = this;
    this.listener = function (event) {
      stream.trigger(event, true);
    };
  }

  return this.listener;
};

Pro.Stream.prototype.defer = function (event, callback) {
  if (callback.property) {
    Pro.Observable.prototype.defer.call(this, event, callback);
    return;
  }

  if (Pro.Utils.isFunction(callback)) {
    Pro.flow.push(callback, [event]);
  } else {
    Pro.flow.push(callback, callback.call, [event]);
  }
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

Pro.Stream.prototype.reduce = function (initVal, f) {
  return new Pro.Val(initVal).in(this.accumulate(initVal, f));
};

Pro.Stream.prototype.merge = function (stream) {
  return new Pro.Stream(this).in(stream);
};
