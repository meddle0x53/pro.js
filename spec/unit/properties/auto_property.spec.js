'use strict';

describe('Pro.AutoProperty', function () {
  var obj;
  beforeEach(function () {
    obj = {
      a: 5,
      ap: function () {return this.a},
      app: function () {return this.ap + 1}
    };
  });

  it('is lazy', function () {
    var original = obj.ap,
        property = new Pro.AutoProperty(obj, 'ap'),
        value = null;

    expect(obj.__pro__.originals).toBe(undefined);
    expect(typeof(property.val)).toBe('function');
    expect(property.val).toBe(original);

    value = obj.ap;
    expect(obj.__pro__.originals).not.toBe(undefined);
    expect(obj.__pro__.originals.ap).not.toBe(undefined);
    expect(obj.__pro__.originals.ap).toBe(original);
    expect(typeof(property.val)).not.toBe('function');
    expect(property.val).toEqual(obj.a);
  });

  it('changes when a sub-prop changes', function () {
    var property = new Pro.Property(obj, 'a'),
        autoProperty = new Pro.AutoProperty(obj, 'ap');

    expect(obj.a).toEqual(obj.ap);

    obj.a = 10;
    expect(obj.a).toEqual(obj.ap);
  });

  it('changes when an auto sub-prop changes', function () {
    var property = new Pro.Property(obj, 'a'),
        autoProperty = new Pro.AutoProperty(obj, 'ap'),
        autoPProperty = new Pro.AutoProperty(obj, 'app');

    expect(obj.a).toEqual(obj.ap);
    expect(obj.ap + 1).toEqual(obj.app);

    obj.a = 10;
    expect(obj.a).toEqual(obj.ap);
    expect(obj.ap + 1).toEqual(obj.app);
  });
});
