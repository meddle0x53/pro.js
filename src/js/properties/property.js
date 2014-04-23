Pro.Property = function (proObject, property, getter, setter) {
  var _this = this;

  this.proObject = proObject;
  this.property = property;

  if (!this.proObject['__pro__']) {
    this.proObject['__pro__'] = {};
  }
  this.proObject['__pro__'].properties = this.proObject['__pro__'].properties || {};
  this.proObject['__pro__'].properties[property] = this;

  this.get = getter || function () {
    _this.addCaller();

    return _this.val;
  };
  this.set = setter || function (newVal) {
    if (_this.val === newVal) {
      return;
    }

    _this.oldVal = _this.val;
    _this.val = newVal;

    Pro.flow.run(function () {
      _this.willUpdate();
    });

  };

  this.oldVal = null;
  this.val = proObject[property];
  this.listeners = [];

  this.state = Pro.States.init;
  this.g = this.get;
  this.s = this.set;

  this.init();
};

Pro.Property.prototype.init = function () {
  if (this.state !== Pro.States.init) {
    return;
  }

  Object.defineProperty(this.proObject, this.property, {
    get: this.get,
    set: this.set,
    enumerable: true,
    configurable: true
  });

  this.state = Pro.States.ready;
};

Pro.Property.prototype.addCaller = function () {
  var _this = this,
      caller = Pro.currentCaller;

  if (caller && caller.property.property != this.property) {
    this.addListener(caller);
  }
};

Pro.Property.prototype.destroy = function () {
  if (this.state === Pro.States.destroyed) {
    return;
  }

  delete this.proObject['__pro__'].properties[this.property];
  this.listeners = undefined;
  this.oldVal = undefined;

  Object.defineProperty(this.proObject, this.property, {
    value: this.val,
    enumerable: true,
    configurable: true
  });
  this.get = this.set = this.property = this.proObject = undefined;
  this.g = this.s = undefined;
  this.val = undefined;
  this.state = Pro.States.destroyed;
};

Pro.Property.prototype.addListener = function (listener) {
  this.listeners.push(listener);
};

Pro.Property.prototype.removeListener = function (listener) {
  var i;
  for (i = 0; i < this.listeners.length; i++) {
    if (this.listeners[i] == listener) {
      this.listeners.splice(i, 1);
      break;
    }
  }
};

Pro.Property.prototype.notifyAll = function () {
  var i;
  for (i = 0; i < this.listeners.length; i++) {
    this.listeners[i].call(this.proObject);
  }
};

Pro.Property.prototype.willUpdate = function () {
  var i, listener,
      listeners = this.listeners,
      length = listeners.length;
  for (i = 0; i < length; i++) {
    listener = listeners[i];

    Pro.flow.pushOnce(listener, listener.call);
    listener.property.willUpdate();
  }
};
