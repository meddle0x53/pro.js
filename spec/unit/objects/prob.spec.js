'use strict';

describe('Pro.prob', function () {
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

});
