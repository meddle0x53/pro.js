'use strict';

describe('Pro.Array', function () {
  it('is array-like object', function () {
    var array = new Pro.Array(3, 4, 5, 4), ind,
        transformedArray, result;

    expect(array.length).toBe(4);
    expect(array.concat(6, 7).length).toBe(6);
    expect(array.every(function (el) { return typeof(el) === 'number';})).toBe(true);
    expect(array.every(function (el) { return el % 2 === 0;})).toBe(false);
    expect(array.some(function (el) { return typeof(el) === 'number';})).toBe(true);
    expect(array.some(function (el) { return el % 2 === 0;})).toBe(true);
    expect(array.filter(function (el) { return el % 2 === 0;}).length).toBe(2);
    expect(array.indexOf(4)).toBe(1);
    expect(array.indexOf(4, 2)).toBe(3);
    expect(array.indexOf(3, 2)).toBe(-1);
    expect(array.lastIndexOf(4)).toBe(3);
    expect(array.join(',')).toEqual('3,4,5,4');
    expect(array.toString()).toEqual(array._array.toString());

    ind = 0;
    array.forEach(function (el, i, arr) {
      expect(typeof(el)).toEqual('number');
      expect(el).toEqual(array._array[i]);
      expect(i).toEqual(ind);
      expect(arr).toBe(array._array);

      ind++;
    });

    ind = 0;
    transformedArray = array.map(function (el, i, arr) {
      expect(typeof(el)).toEqual('number');
      expect(el).toEqual(array._array[i]);
      expect(i).toEqual(ind);
      expect(arr).toBe(array._array);

      ind++;
      return el*el;
    });
    expect(transformedArray.length).toBe(4);
    expect(transformedArray.indexOf(9)).toBe(0);

    ind = 1;
    result = array.reduce(function (curr, el, i, arr) {
      expect(typeof(el)).toEqual('number');
      expect(el).toEqual(array._array[i]);
      expect(i).toEqual(ind);
      expect(arr).toBe(array._array);

      ind++;
      return curr + el;
    });
    expect(result).toBe(16);

    ind = array.length - 1;
    result = array.reduceRight(function (curr, el, i, arr) {
      expect(typeof(el)).toEqual('number');
      expect(el).toEqual(array._array[i]);
      expect(i).toEqual(ind);
      expect(arr).toBe(array._array);

      ind--;
      return curr + el;
    }, 0);
    expect(result).toBe(16);

    expect(array.pop()).toBe(4);
    expect(array.length).toBe(3);
    expect(array.lastIndexOf(4)).toBe(1);

    array.push(4);
    expect(array.length).toBe(4);
    expect(array.lastIndexOf(4)).toBe(3);
    array.push(7, 8);
    expect(array.length).toBe(6);
    expect(array.indexOf(7)).toBe(4);
    expect(array.indexOf(8)).toBe(5);

    array.reverse();
    expect(array.indexOf(8)).toBe(0);
    expect(array.indexOf(3)).toBe(5);

    expect(array.shift()).toBe(8);
    expect(array.length).toBe(5);
    expect(array.lastIndexOf(8)).toBe(-1);

    transformedArray = array.slice(1, 3);
    expect(array.length).toBe(5);
    expect(transformedArray.length).toBe(2);
    transformedArray.push(9);
    expect(transformedArray.length).toBe(3);

    array.sort();
    expect(array.indexOf(7)).toBe(4);
    expect(array.indexOf(3)).toBe(0);

    result = array.splice(1, 2, 'four');
    expect(array.length).toBe(4);
    expect(array.indexOf('four')).toBe(1);
    expect(result.length).toBe(2);
    expect(result.indexOf(4)).toBe(0);
    expect(result.lastIndexOf(4)).toBe(1);

    expect(array instanceof Array).toBe(true);
    expect(Pro.Utils.isArrayObject(array)).toBe(true);
    expect(Pro.Utils.isProArray(array)).toBe(true);
    expect(Pro.Utils.isArray(array)).toBe(false);
  });

  it('is observable by index', function () {
    var array = new Pro.Array(1, 2, 3, 4, 5),
        op, i, ov, nv;

    array.addIndexListener(function (operation, index, oldValue, newValue) {
      op = operation;
      i = index;
      ov = oldValue;
      nv = newValue;
    });

    array[0] = 33;
    expect(array[0]).toBe(33);
    expect(op).toBe(Pro.Array.Operations.set);
    expect(i).toBe(0);
    expect(ov).toBe(1);
    expect(nv).toBe(33);

    array[2] = 35;
    expect(array[2]).toBe(35);
    expect(op).toBe(Pro.Array.Operations.set);
    expect(i).toBe(2);
    expect(ov).toBe(3);
    expect(nv).toBe(35);

  });

  it('it adds index listener on index get', function () {
    var array = new Pro.Array(1, 2, 3, 4, 5),
        op, i, ov, nv,
        callTimes = 0;

    Pro.currentCaller = function (operation, index, oldValue, newValue) {
      op = operation;
      i = index;
      ov = oldValue;
      nv = newValue;

      callTimes = callTimes + 1;
    };
    array[0];
    array[1];
    array[2];
    Pro.currentCaller = null;

    array[0] = 33;
    expect(array[0]).toBe(33);
    expect(op).toBe(Pro.Array.Operations.set);
    expect(i).toBe(0);
    expect(ov).toBe(1);
    expect(nv).toBe(33);

    array[1] = 43;
    expect(array[1]).toBe(43);
    expect(op).toBe(Pro.Array.Operations.set);
    expect(i).toBe(1);
    expect(ov).toBe(2);
    expect(nv).toBe(43);

    array[2] = 35;
    expect(array[2]).toBe(35);
    expect(op).toBe(Pro.Array.Operations.set);
    expect(i).toBe(2);
    expect(ov).toBe(3);
    expect(nv).toBe(35);

    expect(callTimes).toBe(3);
  });

  it('updates properties depending on it by index', function () {
    var array = new Pro.Array(1, 2, 3, 4, 5),
        obj = {
          prop: function () {
            return array[1] + array[2];
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toBe(array[1] + array[2]);

    array[1] = 0;
    expect(obj.prop).toBe(3);

    array[2] = 30;
    expect(obj.prop).toBe(30);
  });

  it('updates properties depending on it by length', function () {
    var array = new Pro.Array(1, 2, 3, 4, 5),
        obj = {
          prop: function () {
            return array.length;
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toBe(array.length);

    array.length = 10;
    expect(obj.prop).toBe(10);

    array.length = 0;
    expect(obj.prop).toBe(0);
  });

  it('updates properties depending on #concat', function () {
    var array = new Pro.Array(1, 2, 3, 4, 5),
        obj = {
          prop: function () {
            return array.concat(6, 7, 8, 9);
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop.valueOf()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    array[0] = 10;
    expect(obj.prop.valueOf()).toEqual([10, 2, 3, 4, 5, 6, 7, 8, 9]);

    array.length = 1;
    expect(obj.prop).toEqual(array.concat(6, 7, 8, 9));

    array.push(200);
    expect(obj.prop).toEqual(array.concat(6, 7, 8, 9));

    array.pop();
    expect(obj.prop).toEqual(array.concat(6, 7, 8, 9));
  });

  it('updates properties depending on #every', function () {
    var array = new Pro.Array(2, 4, 6, 8, 10),
        obj = {
          prop: function () {
            return array.every(function (el) {
              return el % 2 === 0;
            });
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toEqual(true);

    array[0] = 1;
    expect(obj.prop).toEqual(false);
    array[0] = 12;
    expect(obj.prop).toEqual(true);

    array.unshift(13);
    expect(obj.prop).toEqual(false);

    array.shift();
    expect(obj.prop).toEqual(true);
  });

  it('updates properties depending on #some', function () {
    var array = new Pro.Array(2, 4, 5, 9, 10),
        obj = {
          prop: function () {
            return array.some(function (el) {
              return el % 3 === 0;
            });
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toEqual(true);

    array[3] = 10;
    expect(obj.prop).toEqual(false);

    array.unshift(12);
    expect(obj.prop).toEqual(true);
  });

  it('updates properties depending on #filter', function () {
    var array = new Pro.Array(2, '4', 5, '9', 10),
        obj = {
          prop: function () {
            return array.filter(function (el) {
              return typeof(el) === 'string';
            });
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop.toArray()).toEqual(['4', '9']);

    array[0] = '2';
    expect(obj.prop.toArray()).toEqual(['2', '4', '9']);

    array.shift();
    expect(obj.prop.toArray()).toEqual(['4', '9']);
  });

  it('updates properties depending on #forEach', function () {
    var array = new Pro.Array(3, 5, 4),
        obj = {
          prop: function () {
            var sum = 0;
            array.forEach(function (el) {
              sum += el * el;
            });
            return sum;
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toEqual(50);

    array[1] = 0;
    expect(obj.prop).toEqual(25);

    array.pop();
    expect(obj.prop).toEqual(9);

    array.length = 0;
    expect(obj.prop).toEqual(0);
  });

  it('updates properties depending on #map', function () {
    var array = new Pro.Array(3, 5, 4),
        obj = {
          prop: function () {
            return array.map(function (el) {
              return el * el;
            });
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop.valueOf()).toEqual([9, 25, 16].valueOf());

    array[1] = 2;
    expect(obj.prop.valueOf()).toEqual([9, 4, 16].valueOf());

    array.push(1);
    expect(obj.prop.valueOf()).toEqual([9, 4, 16, 1].valueOf());
  });

  it('updates properties depending on #reduce', function () {
    var array = new Pro.Array(3, 5, 4),
        obj = {
          prop: function () {
            return array.reduce(function (sum, el2) {
              return (sum + (el2 * el2));
            }, 0);
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toEqual(50);

    array[1] = 0;
    expect(obj.prop).toEqual(25);

    array.pop();
    expect(obj.prop).toEqual(9);

    array.length = 0;
    expect(obj.prop).toEqual(0);
  });

  it('updates properties depending on #reduceRight', function () {
    var array = new Pro.Array(3, 5, 4),
        obj = {
          prop: function () {
            return array.reduceRight(function (sum, el2) {
              return (sum + (el2 * el2));
            }, 0);
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toEqual(50);

    array[1] = 0;
    expect(obj.prop).toEqual(25);

    array.pop();
    expect(obj.prop).toEqual(9);

    array.length = 0;
    expect(obj.prop).toEqual(0);
  });

  it('updates properties depending on #indexOf', function () {
    var array = new Pro.Array(3, 5, 4),
        obj = {
          prop: function () {
            return array.indexOf(3);
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toEqual(0);

    array[0] = 0;
    expect(obj.prop).toEqual(-1);

    array.push(3);
    expect(obj.prop).toEqual(3);

    array.length = 0;
    expect(obj.prop).toEqual(-1);
  });

  it('updates properties depending on #lastIndexOf', function () {
    var array = new Pro.Array(3, 5, 4),
        obj = {
          prop: function () {
            return array.lastIndexOf(3);
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toEqual(0);

    array[2] = 3;
    expect(obj.prop).toEqual(2);

    array.push(3);
    expect(obj.prop).toEqual(3);

    array.pop();
    expect(obj.prop).toEqual(2);
  });

  it('updates properties depending on #join', function () {
    var array = new Pro.Array(3, 5, 4),
        obj = {
          prop: function () {
            return array.join('-');
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toEqual('3-5-4');

    array[2] = 3;
    expect(obj.prop).toEqual('3-5-3');

    array.push(4);
    expect(obj.prop).toEqual('3-5-3-4');

    array.shift();
    expect(obj.prop).toEqual('5-3-4');
  });

  it('updates properties depending on #toString', function () {
    var array = new Pro.Array(3, 5, 4),
        obj = {
          prop: function () {
            return array.toString();
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toEqual(array.toString());

    array[2] = 5;
    expect(obj.prop).toEqual(array.toString());

    array.push(42);
    expect(obj.prop).toEqual(array.toString());
  });

  it('updates properties depending on #slice', function () {
    var array = new Pro.Array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10),
        obj = {
          prop: function () {
            return array.slice(1, 5);
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop.valueOf()).toEqual([2, 3, 4, 5]);

    array[2] = 5;
    expect(obj.prop.valueOf()).toEqual([2, 5, 4, 5]);

    array.shift();
    expect(obj.prop.valueOf()).toEqual([5, 4, 5, 6]);
  });

  it('#reverse updates depending properties', function () {
    var array = new Pro.Array(1, 2, 3),
        obj = {
          prop: function () {
            return array[0] + array.length;
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toEqual(4);

    array.reverse();
    expect(obj.prop).toEqual(6);

  });

  it('#sort updates depending properties', function () {
    var array = new Pro.Array(4, 1, 2, 3),
        obj = {
          prop: function () {
            return '[' + array[0] + ', ' + array[3] + ']';
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toEqual('[4, 3]');

    array.sort();
    expect(obj.prop).toEqual('[1, 4]');

  });

  it('#push updates depending properties and adds new index dependencies', function () {
    var array = new Pro.Array(4, 1, 2, 3),
        obj = {
          prop: function () {
            if (array[5] === undefined) {
              array.length;
              return array[0];
            }
            return array[1] + array[5];
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toBe(4);

    array.push(4, 5, 6);
    expect(obj.prop).toBe(1 + 5);

    array[5] = 3;
    expect(obj.prop).toBe(1 + 3);
  });

  it('#pop updates depending properties and removes index dependencies', function () {
    var array = new Pro.Array(4, 1, 2, 3),
        obj = {
          prop: function () {
            if (array[3] === undefined) {
              return array[0];
            } else {
              array.length;
            }

            return array[2] + array[3];
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toBe(5);

    array.pop();
    expect(obj.prop).toBe(4);

    array[3] = 7;
    expect(obj.prop).toBe(4);
  });

  it('#unshift updates depending properties and adds new index dependencies', function () {
    var array = new Pro.Array(4, 1, 2, 3),
        obj = {
          prop: function () {
            if (array[5] === undefined) {
              array.length;
              return array[0];
            }
            return array[1] + array[5];
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toBe(4);

    array.unshift(4, 5, 6);
    expect(obj.prop).toBe(2 + 5);

    array[5] = 3;
    expect(obj.prop).toBe(3 + 5);
  });

  it('#shift updates depending properties and removes index dependencies', function () {
    var array = new Pro.Array(4, 1, 2, 3),
        obj = {
          prop: function () {
            if (array[3] === undefined) {
              return array[0];
            } else {
              array.length;
            }

            return array[2] + array[3];
          }
        },
        property = new Pro.AutoProperty(obj, 'prop');

    expect(obj.prop).toBe(5);

    array.shift();
    expect(obj.prop).toBe(1);

    array[3] = 7;
    expect(obj.prop).toBe(1);
  });

  it('#splice updates the right listeners depending on the splice action', function () {
    var array = new Pro.Array(4, 1, 2, 3, 5),
        i, ov, nv, stack = [];

    array.addIndexListener(function (op, index, oldVals, newVals) {
      expect(op).toBe(Pro.Array.Operations.splice);
      i = index;
      ov = oldVals;
      nv = newVals;
      stack.push('index');
    });

    array.addLengthListener(function (op, index, oldVals, newVals) {
      expect(op).toBe(Pro.Array.Operations.splice);
      i = index;
      ov = oldVals;
      nv = newVals;
      stack.push('length');
    });

    // only removing
    array.splice(1, 2);
    expect(i).toBe(1);
    expect(ov).toEqual([1, 2]);
    expect(nv).toEqual([]);
    expect(stack.length).toEqual(1);
    expect(stack[stack.length - 1]).toEqual('length');

    // [4, 3, 5] only adding
    array.splice(2, 0, 7, 8, 9);
    expect(i).toBe(2);
    expect(ov).toEqual([]);
    expect(nv).toEqual([7, 8, 9]);
    expect(stack.length).toEqual(2);
    expect(stack[stack.length - 1]).toEqual('length');

    // [4, 3, 7, 8, 9, 5] only changing elements
    array.splice(3, 2, 1, 2);
    expect(i).toBe(3);
    expect(ov).toEqual([8, 9]);
    expect(nv).toEqual([1, 2]);
    expect(stack.length).toEqual(3);
    expect(stack[stack.length - 1]).toEqual('index');

    // [4, 3, 7, 1, 2, 5] both removing and changing indexes
    array.splice(2, 4, 2, 1);
    expect(i).toBe(2);
    expect(ov).toEqual([7, 1, 2, 5]);
    expect(nv).toEqual([2, 1]);
    expect(stack.length).toEqual(5);
    expect(stack.slice(3)).toEqual(['length', 'index']);
  });

  it('#splice updates index propeties of the Pro.Array depending on removing and adding', function () {
    var array = new Pro.Array(1, 2, 3, 4, 5),
        o, i, ov, nv, stack = [];

    array.addIndexListener(function (op, index, oldVals, newVals) {
      o = op;
      i = index;
      ov = oldVals;
      nv = newVals;
      stack.push('index');
    });

    array.addLengthListener(function (op, index, oldVals, newVals) {
      o = op;
      i = index;
      ov = oldVals;
      nv = newVals;
      stack.push('length');
    });

    // remove 2 elements
    array.splice(1, 2);
    expect(o).toBe(Pro.Array.Operations.splice);
    expect(i).toBe(1);
    expect(ov).toEqual([2, 3]);
    expect(nv).toEqual([]);
    expect(stack.length).toEqual(1);
    expect(stack[stack.length - 1]).toEqual('length');
    expect(array.length).toBe(3);

    array[3] = 10;
    array[4] = 12;
    expect(stack.length).toEqual(1);
    expect(stack[stack.length - 1]).toEqual('length');
    expect(array.length).toBe(3);

    // add 1 element
    array.splice(3, 0, 6);
    expect(o).toBe(Pro.Array.Operations.splice);
    expect(i).toBe(3);
    expect(ov).toEqual([]);
    expect(nv).toEqual([6]);
    expect(stack.length).toEqual(2);
    expect(stack[stack.length - 1]).toEqual('length');
    expect(array.length).toBe(4);

    array[3] = 12;
    expect(o).toBe(Pro.Array.Operations.set);
    expect(i).toBe(3);
    expect(ov).toEqual(6);
    expect(nv).toEqual(12);
    expect(stack.length).toEqual(3);
    expect(stack[stack.length - 1]).toEqual('index');
    expect(array.length).toBe(4);
  });

  it ('turns array memebers into Pro.Arrays.', function () {
    var array = new Pro.Array(1, [1, 2], [[1, 2, 3], [1, 2, 3, 4], [1, 2, 3, 4, 5]], [[[6], 7], 8]),
        isPA = Pro.Utils.isProArray;

    expect(isPA(array)).toBe(true);
    expect(isPA(array[0])).toBe(false);

    expect(isPA(array[1])).toBe(true);
    expect(isPA(array[1][0])).toBe(false);
    expect(isPA(array[1][1])).toBe(false);

    expect(isPA(array[2])).toBe(true);
    expect(isPA(array[2][0])).toBe(true);
    expect(isPA(array[2][0][0])).toBe(false);
    expect(isPA(array[2][0][1])).toBe(false);
    expect(isPA(array[2][0][2])).toBe(false);

    expect(isPA(array[2])).toBe(true);
    expect(isPA(array[2][1])).toBe(true);
    expect(isPA(array[2][1][0])).toBe(false);
    expect(isPA(array[2][1][1])).toBe(false);
    expect(isPA(array[2][1][2])).toBe(false);
    expect(isPA(array[2][1][3])).toBe(false);

    expect(isPA(array[2])).toBe(true);
    expect(isPA(array[2][2])).toBe(true);
    expect(isPA(array[2][2][0])).toBe(false);
    expect(isPA(array[2][2][1])).toBe(false);
    expect(isPA(array[2][2][2])).toBe(false);
    expect(isPA(array[2][2][3])).toBe(false);
    expect(isPA(array[2][2][4])).toBe(false);

    expect(isPA(array[3])).toBe(true);
    expect(isPA(array[3][0])).toBe(true);
    expect(isPA(array[3][0][0])).toBe(true);
    expect(isPA(array[3][0][0][0])).toBe(false);
    expect(isPA(array[3][0][1])).toBe(false);
    expect(isPA(array[3][1])).toBe(false);

    expect(array.valueOf()).toEqual([1, [1, 2], [[1, 2, 3], [1, 2, 3, 4], [1, 2, 3, 4, 5]], [[[6], 7], 8]]);
  });

  it ('turns object memebers into Pro.Objects.', function () {
    var array = new Pro.Array(1, [1, 2], {a:1, b: 2}, {c:3, d: {e: 4, f: [5, 6]}}, {g:7, h: function () {return this.g + 3;}}),
        isPO = Pro.Utils.isProObject,
        isPA = Pro.Utils.isProArray;

    expect(isPA(array)).toBe(true);
    expect(isPA(array[0])).toBe(false);

    expect(isPA(array[1])).toBe(true);
    expect(isPA(array[1][0])).toBe(false);
    expect(isPA(array[1][1])).toBe(false);

    expect(isPA(array[2])).toBe(false);
    expect(isPO(array[2])).toBe(true);

    expect(isPO(array[3])).toBe(true);
    expect(isPO(array[3].d)).toBe(true);
    expect(isPA(array[3].d.f)).toBe(true);

    expect(isPO(array[4])).toBe(true);
    expect(array[4].h).toEqual(10);
  });

  it ('turns new object memebers into Pro.Objects.', function () {
    var array = new Pro.Array(),
        isPO = Pro.Utils.isProObject,
        isPA = Pro.Utils.isProArray;

    array.push({
      a: 3,
      b: function () {return this.a;}
    });

    expect(isPA(array)).toBe(true);
    expect(isPA(array[0])).toBe(false);
    expect(isPO(array[0])).toBe(true);

    expect(array[0].a).toEqual(array[0].b);
  });

});
