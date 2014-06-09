Pro.Stream = function (source, transforms) {
  this.transforms = transforms ? transforms : [];

  this.buffer = [];
  this.delay = null;
  this.delayId = null;

  Pro.Observable.call(this);

  if (source) {
    this.into(source);
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
  if (this.delay !== null) {
    this.buffer.push(event, useTransformations);
  } else {
    this.go(event, useTransformations);
  }
};

Pro.Stream.prototype.go = function (event, useTransformations) {
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
  return new Pro.Val(initVal).into(this.accumulate(initVal, f));
};

Pro.Stream.prototype.merge = function (stream) {
  return new Pro.Stream(this).into(stream);
};

Pro.Stream.prototype.flush = function () {
  var _this = this, i, b = this.buffer, ln = b.length;
  Pro.flow.run(function () {
    for (i = 0; i < ln; i+= 2) {
      _this.go(b[i], b[i+1]);
    }
  });
};

Pro.Stream.prototype.bufferDelay = function (delay) {
  this.delay = delay;

  if (this.delay !== null) {
    var _this = this;
    this.delayId = setInterval(function () {
      _this.flush();
    }, this.delay);
  } else if (this.delayId !== null){
    clearInterval(this.delayId);
    this.delayId = null;
  }
};
