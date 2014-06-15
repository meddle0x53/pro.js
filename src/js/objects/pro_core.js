Pro.Core = function (object) {
  this.object = object;
  this.properties = {};
  this.state = Pro.States.init;
};

Pro.U.ex(Pro.Core.prototype, {
  prob: function () {
    var _this = this, object = this.object,
        conf = Pro.Configuration,
        keyprops = conf.keyprops,
        keypropList = conf.keypropList;

    try {
      for (property in object) {
        this.makeProp(property);
      }

      if (keyprops && keypropList.indexOf('p') !== -1) {
        Object.defineProperty(object, 'p', {
          enumerable: false,
          configurable: false,
          writeble: false,
          value: function (p) {
            if (!p || p === '*') {
              return _this;
            }

            return _this.properties[p];
          }
        });
      }

      this.state = Pro.States.ready;
    } catch (e) {
      this.state = Pro.States.error;
      throw e;
    }
  },
  makeProp: function (property, listeners) {
    var object = this.object,
        conf = Pro.Configuration,
        keyprops = conf.keyprops,
        keypropList = conf.keypropList,
        isF = Pro.Utils.isFunction,
        isA = Pro.Utils.isArrayObject,
        isO = Pro.Utils.isObject, result;

    if (keyprops && keypropList.indexOf(property) !== -1) {
      throw Error('The property name ' + property + ' is a key word for pro objects! Objects passed to Pro.prob can not contain properties named as keyword properties.');
      return;
    }

    if (object.hasOwnProperty(property) && (object[property] === null || object[property] === undefined)) {
      result = new Pro.NullProperty(object, property);
    } else if (object.hasOwnProperty(property) && !isF(object[property]) && !isA(object[property]) && !isO(object[property])) {
      result = new Pro.Property(object, property);
    } else if (object.hasOwnProperty(property) && isF(object[property])) {
      result = new Pro.AutoProperty(object, property);
    } else if (object.hasOwnProperty(property) && isA(object[property])) {
      result = new Pro.ArrayProperty(object, property);
    } else if (object.hasOwnProperty(property) && isO(object[property])) {
      result = new Pro.ObjectProperty(object, property);
    }

    if (listeners) {
      this.properties[property].listeners = this.properties[property].listeners.concat(listeners);
    }

    return result;
  },
  set: function (property, value) {
    var object = this.object;

    object[property] = value;
    if (this.properties[property]) {
      return;
    }

    this.makeProp(property);
  }
});
