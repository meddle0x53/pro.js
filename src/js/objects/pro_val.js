Pro.Val = function (val) {
  this.v = val;
  if (this.v === undefined) {
    this.v = null;
  }

  Pro.prob(this);
};

Pro.Val.prototype.type = function () {
  return this.__pro__.properties.v.type();
};

Pro.Val.prototype.on = function (listener) {
  this.__pro__.properties.v.on(listener);
  return this;
};

Pro.Val.prototype.addTransformator = function (transformator) {
  this.__pro__.properties.v.addTransformator(transformator);
  return this;
};

Pro.Val.prototype.off = function (listener) {
  this.__pro__.properties.v.off(listener);
  return this;
};

Pro.Val.prototype.into = function (observable) {
  this.__pro__.properties.v.into(observable);
  return this;
};

Pro.Val.prototype.willUpdate = function (source) {
  this.__pro__.properties.v.willUpdate(source);
  return this;
};

Pro.Val.prototype.valueOf = function () {
  return this.__pro__.properties.v.val;
};

Pro.Val.prototype.toString = function () {
  return this.valueOf().toString();
};
