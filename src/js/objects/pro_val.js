Pro.Val = function (val) {
  this.v = val;
  Pro.prob(this);
};

Pro.Val.prototype.type = function () {
  return this.__pro__.properties.v.type();
};

Pro.Val.prototype.on = function (listener) {
  this.__pro__.properties.v.on(listener);
};

Pro.Val.prototype.addTransformator = function (transformator) {
  this.__pro__.properties.v.addTransformator(transformator);

  return this;
};

Pro.Val.prototype.removeListener = function (listener) {
  this.__pro__.properties.v.removeListener(listener);
};

Pro.Val.prototype.willUpdate = function (source) {
  this.__pro__.properties.v.willUpdate(source);
};

Pro.Val.prototype.valueOf = function () {
  return this.__pro__.properties.v.val;
};

Pro.Val.prototype.toString = function () {
  return this.valueOf().toString();
};
