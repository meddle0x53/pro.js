Pro.Array.Listeners = Pro.Array.Listeners || {
  check: function(event) {
    if (event.type !== Pro.Event.Types.array) {
      throw Error('Not implemented for non array events');
    }
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
        val.v = every.call(nv, fun, thisArg);
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
        val.v = every.call(nv, fun, thisArg);
      } else if (every.call(nv, fun, thisArg) && !every.call(ov, fun, thisArg)) {
        val.v = every.apply(original._array, args);
      }
    }
  };
};

Pro.Array.Listeners.some = function (val, original, args) {
  var fun = args[0], thisArg = args[1];
  return function (event) {
    Pro.Array.Listeners.check(event);
    var op  = event.args[0],
        ind = event.args[1],
        ov  = event.args[2],
        nv  = event.args[3],
        sv;
    if (op === Pro.Array.Operations.set) {
      sv = fun.call(thisArg, nv);
      if (val.valueOf() === false && sv) {
        val.v = true;
      } else if (val.valueOf() === true && !sv) {
        val.v = some.apply(original._array, args);
      }
    } else if (op === Pro.Array.Operations.add) {
      if (val.valueOf() === false) {
        val.v = some.call(nv, fun, thisArg);
      }
    } else if (op === Pro.Array.Operations.remove) {
      if (val.valueOf() === true && fun.call(thisArg, ov)) {
        val.v = some.apply(original._array, args);
      }
    } else if (op === Pro.Array.Operations.setLength) {
      if (val.valueOf() === true) {
        val.v = some.apply(original._array, args);
      }
    } else if (op === Pro.Array.Operations.splice) {
      if (val.valueOf() === false) {
        val.v = some.call(nv, fun, thisArg);
      } else if (some.call(ov, fun, thisArg) && !some.call(nv, fun, thisArg)) {
        val.v = some.apply(original._array, args);
      }
    }
  };
};

Pro.Array.Listeners.filter = function (filtered, original, args) {
  var fun = args[0], thisArg = args[1];
  return function (event) {
    Pro.Array.Listeners.check(event);
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

Pro.Array.Listeners.map = function (mapped, original, args) {
  var fun = args[0], thisArg = args[1];
  return function (event) {
    Pro.Array.Listeners.check(event);
    var op  = event.args[0],
        ind = event.args[1],
        ov  = event.args[2],
        nv  = event.args[3],
        nvs, j, ln, mnvs;
    if (op === Pro.Array.Operations.set) {
      mapped[ind] = fun.call(thisArg, nv);
    } else if (op === Pro.Array.Operations.add) {
      mnvs = [];
      nvs = slice.call(nv, 0);
      ln = nvs.length;
      if (ind === 0) {
        j = ln - 1;
        while(j >= 0) {
          mnvs[j] = fun.apply(thisArg, [nvs[j], j, original._array]);
          j--;
        }

        Pro.Array.prototype.unshift.apply(mapped, mnvs);
      } else {
        j = 0;
        while(j < ln) {
          mnvs[j] = fun.apply(thisArg, [nvs[j], original._array.length - (ln - j), original._array]);
          j++;
        }

        Pro.Array.prototype.push.apply(mapped, mnvs);
      }
    } else if (op === Pro.Array.Operations.remove) {
      if (ind === 0) {
        mapped.shift();
      } else {
        mapped.pop();
      }
    } else if (op === Pro.Array.Operations.setLength) {
      mapped.length = nv;
    } else if (op === Pro.Array.Operations.reverse) {
      mapped.reverse();
    } else if (op === Pro.Array.Operations.sort) {
      Pro.Array.prototype.sort.apply(mapped, nv);
    } else if (op === Pro.Array.Operations.splice) {
      mnvs = [];
      j = 0;
      while (j < nv.length) {
        mnvs[j] = fun.apply(thisArg, [nv[j], (j + ind), original._array]);
        j++;
      }

      Pro.Array.prototype.splice.apply(mapped, [
        ind,
        ov.length
      ].concat(mnvs));
    }
  };
};

Pro.Array.Listeners.reduce = function (val, original, args) {
  var oldLn = original._array.length, fun = args[0];
  return function (event) {
    Pro.Array.Listeners.check(event);
    var op  = event.args[0],
        ind = event.args[1],
        ov  = event.args[2],
        nv  = event.args[3];
    if ((op === Pro.Array.Operations.add && ind !== 0) ||
       (op === Pro.Array.Operations.splice && ind >= oldLn && ov.length === 0)) {
      val.v = reduce.apply(nv, [fun, val.valueOf()]);
    } else {
      val.v = reduce.apply(original._array, args);
    }
    oldLn = original._array.length;
  };
};

Pro.Array.Listeners.reduceRight = function (val, original, args) {
  var fun = args[0];
  return function (event) {
    Pro.Array.Listeners.check(event);
    var op  = event.args[0],
        ind = event.args[1],
        ov  = event.args[2],
        nv  = event.args[3];
    if ((op === Pro.Array.Operations.add && ind === 0) ||
       (op === Pro.Array.Operations.splice && ind === 0 && ov.length === 0)) {
      val.v = reduceRight.apply(nv, [fun, val.valueOf()]);
    } else {
      val.v = reduceRight.apply(original._array, args);
    }
  };
};

Pro.Array.Listeners.indexOf = function (val, original, args) {
  var what = args[0], fromIndex = args[1], hasFrom = !!fromIndex;
  return function (event) {
    Pro.Array.Listeners.check(event);
    var op  = event.args[0],
        ind = event.args[1],
        ov  = event.args[2],
        nv  = event.args[3],
        v = val.valueOf(),
        nvi, i;

    if (op === Pro.Array.Operations.set) {
      if (ov === what) {
        val.v = indexOf.apply(original._array, args);
      } else if (nv === what && (ind < v || v === -1) && (!hasFrom || ind >= fromIndex)) {
        val.v = ind;
      }
    } else if (op === Pro.Array.Operations.add) {
      nvi = nv.indexOf(what);
      if (ind === 0) {
        if (nvi !== -1 && (!hasFrom || ind >= fromIndex)) {
          val.v = nvi;
        } else if (v !== -1) {
          val.v = v + nv.length;
        }
      } else if (v === -1 &&  (!hasFrom || ind >= fromIndex)) {
        if (nvi !== -1) {
          val.v = ind;
        }
      }
    } else if (op === Pro.Array.Operations.remove) {
      if (v !== -1) {
        if (ind === 0) {
          if (ov === what && !hasFrom) {
            val.v = indexOf.apply(original._array, args);
          } else {
            val.v = v - 1;
          }
        } else if (what === ov) {
          val.v = -1;
        }
      }
    } else if (op === Pro.Array.Operations.setLength && nv <= v) {
      val.v = -1;
    } else if (op === Pro.Array.Operations.reverse || op === Pro.Array.Operations.sort) {
      val.v = indexOf.apply(original._array, args);
    } else if (op === Pro.Array.Operations.splice) {
      nvi = nv.indexOf(what);
      i = nvi + ind;
      if (ind <= v) {
        if (nvi !== -1 && i < v && (!hasFrom || fromIndex <= i)) {
          val.v = i;
        } else if (nv.length !== ov.length && ov.indexOf(what) === -1) {
          v = v + (nv.length - ov.length);
          if (!hasFrom || v >= fromIndex) {
            val.v = v;
          } else {
            val.v = indexOf.apply(original._array, args);
          }
        } else {
          val.v = indexOf.apply(original._array, args);
        }
      } else if (v === -1 && nvi !== -1) {
        val.v = i;
      }
    }
  };
};

Pro.Array.Listeners.lastIndexOf = function (val, original, args) {
  var what = args[0], fromIndex = args[1], hasFrom = !!fromIndex;
  return function (event) {
    Pro.Array.Listeners.check(event);
    var op  = event.args[0],
        ind = event.args[1],
        ov  = event.args[2],
        nv  = event.args[3],
        v = val.valueOf(),
        nvi, i;

    if (op === Pro.Array.Operations.set) {
      if (ov === what) {
        val.v = lastIndexOf.apply(original._array, args);
      } else if (nv === what && (ind > v || v === -1) && (!hasFrom || ind <= fromIndex)) {
        val.v = ind;
      }
    } else if (op === Pro.Array.Operations.add) {
      nvi = nv.indexOf(what);
      if (ind === 0) {
        if (nvi !== -1 && v === -1 && (!hasFrom || ind <= fromIndex)) {
          val.v = nvi;
        } else if (v !== -1) {
          val.v = v + nv.length;
        }
      } else if (nvi !== -1 && (!hasFrom || (ind + nvi) <= fromIndex)) {
        val.v = ind + nvi;
      }
    } else if (op === Pro.Array.Operations.remove) {
      if (v !== -1) {
        if (ind === 0) {
          val.v = v - 1;
        } else if (what === ov) {
          val.v = lastIndexOf.apply(original._array, args);
        }
      }
    } else if (op === Pro.Array.Operations.splice || op === Pro.Array.Operations.reverse || op === Pro.Array.Operations.sort || (op === Pro.Array.Operations.setLength && nv < ov)) {
      val.v = lastIndexOf.apply(original._array, args);
    }
  };
};

Pro.Array.Listeners.slice = function (sliced, original, args) {
  var s = args[0], e = args[1], hasEnd = !!e;
  return function (event) {
    Pro.Array.Listeners.check(event);
    var op  = event.args[0],
        ind = event.args[1],
        ov  = event.args[2],
        nv  = event.args[3],
        osl;
    if (op === Pro.Array.Operations.set) {
      if (ind >= s && (!hasEnd || ind < e)) {
        sliced[ind - s] = nv;
      }
    } else {
      osl = sliced._array;
      sliced._array = slice.apply(original._array, args);
      sliced.updateByDiff(osl);
    }
  };
};
