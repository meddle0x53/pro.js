Pro.Observable = function () {
  this.listeners = [];
};

Pro.Observable.prototype.addListener = function (listener) {
  this.listeners.push(listener);
};

Pro.Observable.prototype.onVal = Pro.Observable.prototype.addListener;

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

Pro.Observable.prototype.willUpdate = function (source) {
  var i, listener,
      listeners = this.listeners,
      length = listeners.length,
      event = this.makeEvent(source);
  for (i = 0; i < length; i++) {
    listener = listeners[i];

    if (Pro.Utils.isFunction(listener)) {
      Pro.flow.pushOnce(listener, [event]);
    } else {
      Pro.flow.pushOnce(listener, listener.call, [event]);
    }

    if (listener.property) {
      listener.property.willUpdate(event);
    }
  }
};
