Pro.Observable = function () {
  this.listeners = [];
  this.sources = [];

  this.listener = null;
};

Pro.Observable.prototype.makeListener = function () {
  return null;
};

// TODO Deprecated!
Pro.Observable.prototype.addListener = function (listener) {
  this.listeners.push(listener);
};

Pro.Observable.prototype.on = function (action, callback) {
  if (!Pro.Utils.isString(action)) {
    callback = action;
  }

  this.listeners.push(callback);
};

Pro.Observable.prototype.off = function (action, callback) {
  if (!action && !callback) {
    this.listeners = [];
    return;
  }

  if (!Pro.Utils.isString(action)) {
    callback = action;
  }

  this.removeListener(callback);
};

Pro.Observable.prototype.in = function (source) {
  this.sources.push(source);
  source.addListener(this.makeListener());

  return this;
};

Pro.Observable.prototype.out = function (destination) {
  destination.in(this);

  return this;
};

// TODO Remove object from array!
Pro.Observable.prototype.offSource = function (source) {
  var i, s = this.sources, sln = s.length;
  for (i = 0; i < sln; i++) {
    if (s[i] === source) {
      s.splice(i, 1);
      break;
    }
  }
  source.removeListener(this.listener);
};

// TODO This should use special array method.
Pro.Observable.prototype.removeListener = function (listener) {
  var i;
  for (i = 0; i < this.listeners.length; i++) {
    if (this.listeners[i] == listener) {
      this.listeners.splice(i, 1);
      break;
    }
  }
};

Pro.Observable.prototype.makeEvent = function (source) {
  return new Pro.Event(source, this, Pro.Event.Types.value);
};

Pro.Observable.prototype.map = function (f) {};

Pro.Observable.prototype.update = function (source) {
  var observable = this;
  if (!Pro.flow.isRunning()) {
    Pro.flow.run(function () {
      observable.willUpdate(source);
    });
  } else {
    observable.willUpdate(source);
  }
};

Pro.Observable.prototype.defer = function (event, callback) {
  if (Pro.Utils.isFunction(callback)) {
    Pro.flow.pushOnce(callback, [event]);
  } else {
    Pro.flow.pushOnce(callback, callback.call, [event]);
  }
};

Pro.Observable.prototype.willUpdate = function (source) {
  var i, listener,
      listeners = this.listeners,
      length = listeners.length,
      event = this.makeEvent(source);
  for (i = 0; i < length; i++) {
    listener = listeners[i];

    this.defer(event, listener);

    if (listener.property) {
      listener.property.willUpdate(event);
    }
  }
};
