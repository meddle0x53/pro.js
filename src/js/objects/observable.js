Pro.Observable = function () {
  this.listeners = [];
  this.sources = [];

  this.listener = null;
};

Pro.Observable.prototype.makeListener = function () {
  return null;
};

Pro.Observable.prototype.on = function (action, callback) {
  if (!Pro.U.isString(action)) {
    callback = action;
  }

  this.listeners.push(callback);
};

Pro.Observable.prototype.off = function (action, callback) {
  if (!action && !callback) {
    this.listeners = [];
    return;
  }

  if (!Pro.U.isString(action)) {
    callback = action;
  }

  this.removeListener(callback);
};

Pro.Observable.prototype.in = function (source) {
  this.sources.push(source);
  source.on(this.makeListener());

  return this;
};

Pro.Observable.prototype.out = function (destination) {
  destination.in(this);

  return this;
};

Pro.Observable.prototype.offSource = function (source) {
  Pro.U.remove(this.sources, source);
  source.off(this.listener);
};

Pro.Observable.prototype.removeListener = function (listener) {
  Pro.U.remove(this.listeners, listener);
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
  if (Pro.U.isFunction(callback)) {
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
