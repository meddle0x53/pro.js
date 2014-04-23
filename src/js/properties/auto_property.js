Pro.AutoProperty = function (proObject, property) {
  this.func = proObject[property];

  var _this = this,
      getter = function () {
    _this.addCaller();
    var oldCaller = Pro.currentCaller,
        get = Pro.Property.DEFAULT_GETTER(_this),
        set = Pro.Property.DEFAULT_SETTER(_this);

    Pro.currentCaller = {
      property: _this,
      call: function () {
        proObject[property] = _this.func.call(proObject);
      }
    };
    _this.val = _this.func.apply(_this.proObject, arguments);
    Pro.currentCaller = oldCaller;

    Pro.Property.defineProp(_this.proObject, _this.property, get, set);
    return _this.val;
  };

  Pro.Property.call(this, proObject, property, getter, function () {});
};

Pro.AutoProperty.prototype = Object.create(Pro.Property.prototype);;
Pro.AutoProperty.constructor = Pro.AutoProperty;
