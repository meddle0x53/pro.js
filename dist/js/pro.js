;(function(undefined) {
  
  var isFunction = function (functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) == '[object Function]';
  };
  
  prob = function (proObject) {
    for (var property in proObject) {
      if (proObject.hasOwnProperty(property) && !isFunction(proObject[property])) {
        (function (property) {
          var val = proObject[property];
          var listeners = [];
  
          var getter = function () {
            var caller = proObject['__pro_current_caller'];
            if (caller) {
              //console.log(caller)
              listeners.push(function () {
                proObject[caller] = proObject['__pro_original_' + caller].call(proObject);
              });
            }
            return val;
          }
          Object.defineProperty(proObject, property, {
            get: getter,
            set: function (newVal) {
              var oldVal = val;
              val = newVal;
  
              console.log('Set ' + property + ' from ' + oldVal + ' to ' + newVal);
              for (var i = 0; i < listeners.length; i++) {
                listeners[i].call(proObject);
              }
            },
            enumerable: true,
            configurable: true
          });
        })(property);
      }
  
      if (proObject.hasOwnProperty(property) && isFunction(proObject[property])) {
        (function (property) {
          var func = proObject[property];
          var val = null;
  
          var getter = function () {
            proObject['__pro_current_caller'] = property;
            val = func.apply(proObject, arguments);
            proObject['__pro_current_caller'] = null;
            proObject['__pro_original_' + property] = func;
  
            Object.defineProperty(proObject, property, {
              get: function () {return val;},
              set: function (newVal) {
                var oldVal = val;
                val = newVal;
              },
              enumerable: true,
              configurable: true
            });
  
            return val;
          };
  
          Object.defineProperty(proObject, property, {
            get: getter,
            set: function (newVal) {
            },
            enumerable: true,
            configurable: true
          });
        })(property);
      }
    }
  };
  
}());