Pro.Property = function (proObject, property, getter, setter) {
  var _this = this;

  this.proObject = proObject;
  this.property = property;

  if (!this.proObject['__pro__']) {
    this.proObject['__pro__'] = {};
  }
  this.proObject['__pro__'].properties = this.proObject['__pro__'].properties || {};
  this.proObject['__pro__'].properties[property] = this;

  this.get = getter || Pro.Property.DEFAULT_GETTER(this);
  this.set = setter || Pro.Property.DEFAULT_SETTER(this);

  this.oldVal = null;
  this.val = proObject[property];
  this.listeners = [];

  this.state = Pro.States.init;
  this.g = this.get;
  this.s = this.set;

  this.init();
};

Pro.Property.Types = {
  simple: 0, // strings, booleans and numbers
  auto: 1, // functions - dependent
  object: 2, // references Pro objects
  array: 3, // arrays
  nil: 4 // nulls
};

Pro.Property.DEFAULT_GETTER = function (property) {
  return function () {
    property.addCaller();

    return property.val;
  };
};

Pro.Property.DEFAULT_SETTER = function (property) {
  return function (newVal) {
    if (property.val === newVal) {
      return;
    }

    property.oldVal = property.val;
    property.val = newVal;

    Pro.flow.run(function () {
      property.willUpdate();
    });
  };
};

Pro.Property.defineProp = function (obj, prop, get, set) {
  Object.defineProperty(obj, prop, {
    get: get,
    set: set,
    enumerable: true,
    configurable: true
  });
};

Pro.Property.prototype.type = function () {
  return Pro.Property.Types.simple;
};

Pro.Property.prototype.init = function () {
  if (this.state !== Pro.States.init) {
    return;
  }

  Pro.Property.defineProp(this.proObject, this.property, this.get, this.set);

  this.afterInit();
};

Pro.Property.prototype.afterInit = function () {
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

Pro.Property.prototype.willUpdate = function (source) {
  var i, listener,
      listeners = this.listeners,
      length = listeners.length,
      event = new Pro.Event(source, this, Pro.Event.Types.value);
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
