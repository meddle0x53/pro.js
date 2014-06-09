Pro.Observable = function () {
  this.listeners = [];
  this.sources = [];

  this.listener = null;
};

Pro.Observable.prototype = {
  constructor: Pro.Observable,

  makeListener: function () {
    return null;
  },

  makeEvent: function (source) {
    return new Pro.Event(source, this, Pro.Event.Types.value);
  },

  on: function (action, callback) {
    if (!Pro.U.isString(action)) {
      callback = action;
    }

    this.listeners.push(callback);

    return this;
  },

  off: function (action, callback) {
    if (!action && !callback) {
      this.listeners = [];
      return;
    }
    if (!Pro.U.isString(action)) {
      callback = action;
    }

    Pro.U.remove(this.listeners, callback);

    return this;
  },

  into: function (source) {
    this.sources.push(source);
    source.on(this.makeListener());

    return this;
  },

  out: function (destination) {
    destination.into(this);

    return this;
  },

  offSource: function (source) {
    Pro.U.remove(this.sources, source);
    source.off(this.listener);
  },

  map: Pro.N,

  update: function (source) {
    var observable = this;
    if (!Pro.flow.isRunning()) {
      Pro.flow.run(function () {
        observable.willUpdate(source);
      });
    } else {
      observable.willUpdate(source);
    }
  },

  willUpdate: function (source) {
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
  },

  defer: function (event, callback) {
    if (Pro.U.isFunction(callback)) {
      Pro.flow.pushOnce(callback, [event]);
    } else {
      Pro.flow.pushOnce(callback, callback.call, [event]);
    }
  }
};
