'use strict';

describe('Pro.prob', function () {

  beforeEach(function () {
    Pro.Configuration = {
      keyprops: true,
      keypropList: ['p']
    };
  }),

  it('makes normal object with simple properties a Pro object.', function () {
    var obj = {
      a: 1,
      b: '2',
      c: true,
      d: 2.3,
    }, proObject;

    proObject = Pro.prob(obj);

    expect(proObject).toBe(obj);
    expect(proObject.__pro__).not.toBe(undefined);
    expect(proObject.__pro__.state).toBe(Pro.States.ready);

    expect(proObject.__pro__.properties.a.get()).toBe(obj.a);
    expect(proObject.__pro__.properties.b.get()).toBe(obj.b);
    expect(proObject.__pro__.properties.c.get()).toBe(obj.c);
    expect(proObject.__pro__.properties.d.get()).toBe(obj.d);

    expect(proObject.__pro__.properties.a.state).toBe(Pro.States.ready);
    expect(proObject.__pro__.properties.b.state).toBe(Pro.States.ready);
    expect(proObject.__pro__.properties.c.state).toBe(Pro.States.ready);
    expect(proObject.__pro__.properties.d.state).toBe(Pro.States.ready);

    if (Pro.Configuration.keyprops && Pro.Configuration.keypropList.indexOf('p') !== -1) {
      expect(proObject.__pro__.properties.a).toBe(obj.p('a'));
      expect(proObject.__pro__.properties.b).toBe(obj.p('b'));
      expect(proObject.__pro__.properties.c).toBe(obj.p('c'))
      expect(proObject.__pro__.properties.d).toBe(obj.p('d'))
    }
  });

  it('throws an error if there is object with keywprop property', function () {
    Pro.Configuration = {
      keyprops: true,
      keypropList: ['c']
    };

    var obj = {
      a: 1,
      b: '2',
      c: true,
      d: 2.3
    }, proObject;

    expect(function () {
      Pro.prob(obj);
    }).toThrow(new Error('The property name c is a key word for pro objects! Objects passed to Pro.prob can not contain properties named as keyword properties.'));

    expect(obj.__pro__).not.toBe(undefined);
    expect(obj.__pro__.state).toBe(Pro.States.error);
  });

  it('creates pro objects with auto and normal properties from object with simple values and functions', function () {
    var obj = {
      x: 0,
      y: 0,
      sum: function () {
        return this.x + this.y;
      },
      product: function () {
        return this.x * this.y;
      },
      rational: function () {
        return this.x + "/" + this.y;
      }
    }, proObject;

    proObject = Pro.prob(obj);

    expect(proObject).toBe(obj);
    expect(proObject.__pro__).not.toBe(undefined);
    expect(proObject.__pro__.state).toBe(Pro.States.ready);

    expect(proObject.__pro__.properties.x.get()).toBe(obj.x);
    expect(proObject.__pro__.properties.y.get()).toBe(obj.y);
    expect(proObject.__pro__.properties.sum.get()).toBe(obj.sum);
    expect(proObject.__pro__.properties.product.get()).toBe(obj.product);
    expect(proObject.__pro__.properties.rational.get()).toBe(obj.rational);

    expect(proObject.__pro__.properties.x.state).toBe(Pro.States.ready);
    expect(proObject.__pro__.properties.y.state).toBe(Pro.States.ready);
    expect(proObject.__pro__.properties.sum.state).toBe(Pro.States.ready);
    expect(proObject.__pro__.properties.product.state).toBe(Pro.States.ready);
    expect(proObject.__pro__.properties.rational.state).toBe(Pro.States.ready);

    if (Pro.Configuration.keyprops && Pro.Configuration.keypropList.indexOf('p') !== -1) {
      expect(proObject.__pro__.properties.x).toBe(obj.p('x'));
      expect(proObject.__pro__.properties.y).toBe(obj.p('y'));
      expect(proObject.__pro__.properties.sum).toBe(obj.p('sum'))
      expect(proObject.__pro__.properties.product).toBe(obj.p('product'))
      expect(proObject.__pro__.properties.rational).toBe(obj.p('rational'))
    }

    expect(obj.x).toBe(0);
    expect(obj.y).toBe(0);
    expect(obj.sum).toBe(0);
    expect(obj.product).toBe(0);
    expect(obj.rational).toEqual('0/0');

    obj.y = 4;
    obj.x = 5;
    expect(obj.x).toBe(5);
    expect(obj.y).toBe(4);
    expect(obj.sum).toBe(9);
    expect(obj.product).toBe(20);
    expect(obj.rational).toEqual('5/4');
  });

  it('connections between properties of two or more Pro objects work', function () {
    var objA, objB, objC;

    objA = {
      a: 1,
      foo: function () {
        return this.a + objB.b + objC.c;
      }
    };

    objB = {
      b: '1',
      bar: function () {
        return objA.a * this.b * objC.c;
      }
    };

    objC = {
      c: true,
      baz: function () {
        return '(' + objA.a + ', ' + objB.b + ', ' + this.c + ')';
      }
    };

    Pro.prob(objA);
    Pro.prob(objB);
    Pro.prob(objC);

    expect(objA.a).toEqual(1);
    expect(objA.foo).toEqual('11true');
    expect(objB.b).toEqual('1');
    expect(objB.bar).toEqual(1);
    expect(objC.c).toEqual(true);
    expect(objC.baz).toEqual('(1, 1, true)');

    objA.a = 5;
    objB.b = '5';
    objC.c = false;
    expect(objA.a).toEqual(5);
    expect(objA.foo).toEqual('55false');
  });

});
