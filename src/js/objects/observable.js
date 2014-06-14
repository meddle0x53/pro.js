Pro.Observable = function () {
  this.listeners = [];
  this.errListeners = [];
  this.sources = [];

  this.listener = null;
  this.errListener = null;
};

Pro.Observable.prototype = {
  constructor: Pro.Observable,

  makeListener: function () {
    return null;
  },

  makeErrListener: function () {
    return null;
  },

  makeEvent: function (source) {
    return new Pro.Event(source, this, Pro.Event.Types.value);
  },

  on: function (action, callback, callbacks) {
    if (!Pro.U.isString(action)) {
      callback = action;
    }

    if (Pro.U.isArray(callbacks)) {
      callbacks.push(callback);
    } else {
      this.listeners.push(callback);
    }

    return this;
  },

  off: function (action, callback, callbacks) {
    if (!action && !callback) {
      if (Pro.U.isArray(callbacks)) {
        callbacks.length = 0;
      } else {
        this.listeners = [];
      }
      return;
    }
    if (!Pro.U.isString(action)) {
      callback = action;
    }

    if (Pro.U.isArray(callbacks)) {
      Pro.U.remove(callbacks, callback);
    } else {
      Pro.U.remove(this.listeners, callback);
    }

    return this;
  },

  onErr: function (action, callback) {
    return this.on(action, callback, this.errListeners);
  },

  offErr: function (action, callback) {
    return this.off(action, callback, this.errListeners);
  },

  into: function (source) {
    this.sources.push(source);
    source.on(this.makeListener());
    source.onErr(this.makeErrListener());

    return this;
  },

  out: function (destination) {
    destination.into(this);

    return this;
  },

  offSource: function (source) {
    Pro.U.remove(this.sources, source);
    source.off(this.listener);
    source.offErr(this.errListener);

    return this;
  },

  map: Pro.N,

  update: function (source, callbacks) {
    var observable = this;
    if (!Pro.flow.isRunning()) {
      Pro.flow.run(function () {
        observable.willUpdate(source, callbacks);
      });
    } else {
      observable.willUpdate(source, callbacks);
    }
    return this;
  },

  willUpdate: function (source, callbacks) {
    var i, listener,
        listeners = Pro.U.isArray(callbacks) ? callbacks : this.listeners,
        length = listeners.length,
        event = this.makeEvent(source);
    for (i = 0; i < length; i++) {
      listener = listeners[i];

      this.defer(event, listener);

      if (listener.property) {
        listener.property.willUpdate(event);
      }
    }
    return this;
  },

  defer: function (event, callback) {
    if (Pro.U.isFunction(callback)) {
      Pro.flow.pushOnce(callback, [event]);
    } else {
      Pro.flow.pushOnce(callback, callback.call, [event]);
    }
    return this;
  }
};
