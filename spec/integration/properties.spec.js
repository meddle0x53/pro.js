'use strict';

describe('Pro.Property, Pro.AutoProperty, Pro.ObjectProperty, Pro.ArrayProperty and Pro.NullProperty', function () {
  var obj;
  beforeEach(function () {
    obj = Pro.prob({
      a: 1,
      b: 'one',
      c: null,
      d: undefined,
      e: {
        a: 1.1,
        b: true
      },
      f: [1, false, null, ['two', {a: 3}], function () {
        return obj.a;
      }],
      g: Pro.prob(5),
      h: Pro.prob([1, 2, ['one']]),
      i: Pro.prob({a: 4, b: '5'}),
      j: Pro.prob(null),
      k: function () {
        if (this.c) {
          return this.e.b;
        }

        return this.f[1];
      },
      l: Pro.prob(function () {
        return obj.g.v;
      })
    });
  });

  it ('null property can become simple property', function () {
    expect(obj.p('c').type()).toEqual(Pro.Property.Types.nil);
    expect(obj.k).toEqual(false);
    expect(obj.p('c').listeners.length).toEqual(1);

    obj.c = 17;
    expect(obj.c).toEqual(17);
    expect(obj.p('c').type()).toEqual(Pro.Property.Types.simple);
    expect(obj.p('c').listeners.length).toEqual(1);
    expect(obj.k).toEqual(true);

    obj.c = 0;
    expect(obj.k).toEqual(false);
  });

  it ('null property can become auto property', function () {
    expect(obj.k).toEqual(false);

    obj.c = function () {
      return this.a + this.e.a;
    };
    expect(obj.c).toEqual(2.1);
    expect(obj.p('c').type()).toEqual(Pro.Property.Types.auto);
    expect(obj.p('c').listeners.length).toEqual(1);
    expect(obj.k).toEqual(true);

    obj.e.a = 1;
    expect(obj.c).toEqual(2);

    obj.a = -1;
    expect(obj.c).toEqual(0);
    expect(obj.k).toEqual(false);
  });

  it ('null property can become array property', function () {
    expect(obj.k).toEqual(false);

    obj.c = [4];
    expect(Pro.U.isProArray(obj.c)).toBe(true);
    expect(obj.c.valueOf()).toEqual([4]);
    expect(obj.p('c').type()).toEqual(Pro.Property.Types.array);
    expect(obj.p('c').listeners.length).toEqual(1);
    expect(obj.k).toEqual(true);
  });

  it ('null property can become object property', function () {
    expect(obj.k).toEqual(false);

    obj.c = {a: 'null'};
    expect(Pro.U.isProObject(obj.c)).toBe(true);
    expect(obj.c.a).toEqual('null');
    expect(obj.p('c').type()).toEqual(Pro.Property.Types.object);
    expect(obj.p('c').listeners.length).toEqual(1);
    expect(obj.k).toEqual(true);

    obj.c = {};
  });
});
