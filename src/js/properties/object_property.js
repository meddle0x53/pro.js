Pro.ObjectProperty = function (proObject, property) {
  var _this = this, getter;

  getter = function () {
    _this.addCaller();
    if (!_this.val.__pro__) {
      Pro.prob(_this.val);
    }

    var get = Pro.Property.DEFAULT_GETTER(_this),
        set = Pro.Property.DEFAULT_SETTER(_this);

    Pro.Property.defineProp(_this.proObject, _this.property, get, set);
    return _this.val;
  };

  Pro.Property.call(this, proObject, property, getter, function () {});
};


Pro.ObjectProperty.prototype = Object.create(Pro.Property.prototype);;
Pro.ObjectProperty.constructor = Pro.ObjectProperty;
