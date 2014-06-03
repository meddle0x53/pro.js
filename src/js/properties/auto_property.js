Pro.AutoProperty = function (proObject, property) {
  this.func = proObject[property];

  var _this = this,
      getter = function () {
    _this.addCaller();
    var oldCaller = Pro.currentCaller,
        get = Pro.Property.DEFAULT_GETTER(_this),
        set = Pro.Property.DEFAULT_SETTER(_this);

    Pro.currentCaller = _this.makeListener();
    _this.val = _this.func.apply(_this.proObject, arguments);
    Pro.currentCaller = oldCaller;

    Pro.Property.defineProp(_this.proObject, _this.property, get, set);

    _this.state = Pro.States.ready;

    _this.val = Pro.Property.transform(_this, _this.val);
    return _this.val;
  };

  Pro.Property.call(this, proObject, property, getter, function () {});
};

Pro.AutoProperty.prototype = Object.create(Pro.Property.prototype);
Pro.AutoProperty.prototype.constructor = Pro.AutoProperty;

Pro.AutoProperty.prototype.type = function () {
  return Pro.Property.Types.auto;
};

Pro.AutoProperty.prototype.makeListener = function () {
  if (!this.listener) {
    var _this = this;
    this.listener = {
      property: _this,
      call: function () {
        _this.oldVal = _this.val;
        _this.val = Pro.Property.transform(_this, _this.func.call(_this.proObject));
      }
    };
  }

  return this.listener;
};

Pro.AutoProperty.prototype.afterInit = function () {};
