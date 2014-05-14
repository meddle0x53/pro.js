Pro.Array.Listeners = Pro.Array.Listeners || {};

Pro.Array.Listeners.check = function(event) {
  if (event.type !== Pro.Event.Types.array) {
    throw Error('Not implemented for non array events');
  }
};

Pro.Array.Listeners.leftConcat = function (transformed, original, args) {
  return function (event) {
    Pro.Array.Listeners.check(event);
    var op    = event.args[0],
        ind   = event.args[1],
        ov    = event.args[2],
        nv    = event.args[3],
        argln = args.length,
        nvs, toAdd;
    if (op === Pro.Array.Operations.set) {
      transformed[ind] = nv;
    } else if (op === Pro.Array.Operations.add) {
      nvs = slice.call(nv, 0);
      if (ind === 0) {
        Pro.Array.prototype.unshift.apply(transformed, nvs);
      } else {
        Pro.Array.prototype.splice.apply(transformed, [transformed._array.length - argln, 0].concat(nvs));
      }
    } else if (op === Pro.Array.Operations.remove) {
      if (ind === 0) {
        Pro.Array.prototype.shift.call(transformed, ov);
      } else {
        Pro.Array.prototype.splice.apply(transformed, [transformed._array.length - argln - 1, 1]);
      }
    } else if (op === Pro.Array.Operations.setLength) {
      nvs = ov -nv;
      if (nvs > 0) {
        Pro.Array.prototype.splice.apply(transformed, [nv, nvs]);
      } else {
        toAdd = [ov, 0];
        toAdd.length = 2 - nvs;
        Pro.Array.prototype.splice.apply(transformed, toAdd);
      }
    } else if (op === Pro.Array.Operations.reverse || op === Pro.Array.Operations.sort) {
      nvs = transformed._array;
      if (Pro.Utils.isProArray(args)) {
        toAdd = args._array;
      } else {
        toAdd = args;
      }
      transformed._array = concat.apply(original._array, toAdd);
      transformed.updateByDiff(nvs);
    } else if (op === Pro.Array.Operations.splice) {
      Pro.Array.prototype.splice.apply(transformed, [ind, ov.length].concat(nv));
    }
  };
};

Pro.Array.Listeners.rightConcat = function (transformed, original, right) {
  return function (event) {
    Pro.Array.Listeners.check(event);
    var op    = event.args[0],
        ind   = event.args[1],
        ov    = event.args[2],
        nv    = event.args[3],
        oln   = original._array.length,
        nvs;
    if (op === Pro.Array.Operations.set) {
      transformed[oln + ind] = nv;
    } else if (op === Pro.Array.Operations.add) {
      if (ind === 0) {
        Pro.Array.prototype.splice.apply(transformed, [oln, 0].concat(nv));
      } else {
        Pro.Array.prototype.push.apply(transformed, nv);
      }
    } else if (op === Pro.Array.Operations.remove) {
      if (ind === 0) {
        Pro.Array.prototype.splice.call(transformed, oln, 1);
      } else {
        Pro.Array.prototype.pop.call(transformed, ov);
      }
    } else if (op === Pro.Array.Operations.setLength) {
      transformed.length = oln + nv;
    } else if (op === Pro.Array.Operations.reverse || op === Pro.Array.Operations.sort) {
      nvs = transformed._array;
      transformed._array = concat.apply(original._array, right._array);
      transformed.updateByDiff(nvs);
    } else if (op === Pro.Array.Operations.splice) {
      Pro.Array.prototype.splice.apply(transformed, [ind + oln, ov.length].concat(nv));
    }
  };
};

Pro.Array.Listeners.every = function (val, original, args) {
  var fun = args[0], thisArg = args[1];
  return function (event) {
    Pro.Array.Listeners.check(event);
    var op  = event.args[0],
        ind = event.args[1],
        ov  = event.args[2],
        nv  = event.args[3],
        ev;
    if (op === Pro.Array.Operations.set) {
      ev = fun.call(thisArg, nv);
      if (val.valueOf() === true && !ev) {
        val.v = false;
      } else if (val.valueOf() === false && ev) {
        val.v = every.apply(original._array, args);
      }
    } else if (op === Pro.Array.Operations.add) {
      if (val.valueOf() === true) {
        val.v = Pro.Array.everyNewValue(fun, thisArg, nv);
      }
    } else if (op === Pro.Array.Operations.remove) {
      if (val.valueOf() === false && !fun.call(thisArg, ov)) {
        val.v = every.apply(original._array, args);
      }
    } else if (op === Pro.Array.Operations.setLength) {
      if (val.valueOf() === false) {
        val.v = every.apply(original._array, args);
      }
    } else if (op === Pro.Array.Operations.splice) {
      if (val.valueOf() === true) {
        val.v = Pro.Array.everyNewValue(fun, thisArg, nv);
      } else if (Pro.Array.everyNewValue(fun, thisArg, nv) && !Pro.Array.everyNewValue(fun, thisArg, ov)) {
        val.v = every.apply(original._array, args);
      }
    }
  };
};

Pro.Array.Listeners.filter = function (filtered, original, args) {
  var fun = args[0], thisArg = args[1];
  return function (event) {
    if (event.type !== Pro.Event.Types.array) {
      throw Error('Not implemented for non array events');
    }
    var op  = event.args[0],
        ind = event.args[1],
        ov  = event.args[2],
        nv  = event.args[3],
        napply, oapply, oarr,
        nvs, fnvs, j, ln, diff;

    if (op === Pro.Array.Operations.set) {
      napply = fun.call(thisArg, nv);
      oapply = fun.call(thisArg, ov);

      if (oapply === true || napply === true) {
        Pro.Array.reFilter(original, filtered, args);
      }
    } else if (op === Pro.Array.Operations.add) {
      fnvs = [];
      nvs = slice.call(nv, 0);
      ln = nvs.length;
      if (ind === 0) {
        j = ln - 1;
        while(j >= 0) {
          if (fun.apply(thisArg, [nvs[j], j, original._array])) {
            fnvs.unshift(nvs[j]);
          }
          j--;
        }

        if (fnvs.length) {
          Pro.Array.prototype.unshift.apply(filtered, fnvs);
        }
      } else {
        j = 0;
        while(j < ln) {
          if (fun.apply(thisArg, [nvs[j], original._array.length - (ln - j), original._array])) {
            fnvs.push(nvs[j]);
          }
          j++;
        }

        if (fnvs.length) {
          Pro.Array.prototype.push.apply(filtered, fnvs);
        }
      }
    } else if (op === Pro.Array.Operations.remove) {
      if (fun.apply(thisArg, [ov, ind, original._array])) {
        if (ind === 0) {
          filtered.shift();
        } else {
          filtered.pop();
        }
      }
    } else if (op === Pro.Array.Operations.setLength) {
      Pro.Array.reFilter(original, filtered, args);
    } else if (op === Pro.Array.Operations.reverse) {
      filtered.reverse();
    } else if (op === Pro.Array.Operations.sort) {
      Pro.Array.prototype.sort.apply(filtered, nv);
    } else if (op === Pro.Array.Operations.splice) {
      Pro.Array.reFilter(original, filtered, args);
    }
  };
};
