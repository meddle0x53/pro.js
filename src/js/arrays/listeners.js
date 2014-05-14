Pro.Array.Listeners = Pro.Array.Listeners || {};

Pro.Array.Listeners.check = function(event) {
  if (event.type !== Pro.Event.Types.array) {
    throw Error('Not implemented for non array events');
  }
};

Pro.Array.Listeners.leftConcat = function (transformed, original, args) {
  var argln = [].concat(slice.call(args, 0)).length;
  return function (event) {
    Pro.Array.Listeners.check(event);

    var op    = event.args[0],
        ind   = event.args[1],
        ov    = event.args[2],
        nv    = event.args[3],
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
      transformed._array = concat.apply(original._array, args);
      transformed.updateByDiff(nvs);
    } else if (op === Pro.Array.Operations.splice) {
      Pro.Array.prototype.splice.apply(transformed, [ind, ov.length].concat(nv));
    }
  };
};
