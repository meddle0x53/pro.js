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

  it('beats the diamond problem', function () {
    var counterHash = {},
        object = {
          a: 0,
          c: function () {
            counterHash['c'] = counterHash['c'] || 0;
            counterHash['c'] += 1;

            return this.b + this.a;
          },
          b: function () {
            counterHash['b'] = counterHash['b'] || 0;
            counterHash['b'] += 1;

            return this.a + 5;
          }
        },
        propertyA = new Pro.Property(object, 'a'),
        propertyB = new Pro.AutoProperty(object, 'b'),
        propertyC = new Pro.AutoProperty(object, 'c');

    expect(object.a).toEqual(0);
    expect(object.c).toEqual(5);
    expect(object.b).toEqual(5);
    expect(counterHash['b']).toBe(1);
    expect(counterHash['c']).toBe(1);

    object.a = 4;
    expect(object.c).toEqual(13);
    expect(object.b).toEqual(9);
    expect(counterHash['b']).toBe(2);
    expect(counterHash['c']).toBe(2);

  });
});
