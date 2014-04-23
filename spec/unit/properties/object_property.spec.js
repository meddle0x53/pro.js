'use strict';

describe('Pro.ObjectProperty', function () {
  var obj;
  beforeEach(function () {
    obj = {
      a: 5,
      ap: function () {
        return this.a + this.op.b;
      },
      op: {
        b: 4
      }
    };
  });

  it('is lazy', function () {
    var original = obj.op,
        property = new Pro.ObjectProperty(obj, 'op');

    expect(property.val.__pro__).toBe(undefined);
    expect(property.val).toBe(original);

    obj.op;
    expect(property.val.__pro__).not.toBe(undefined);
    expect(property.val).toEqual(obj.op);
  });

  it('auto properties of object container are updated by object properties they depend on.', function () {
    var property = new Pro.Property(obj, 'a'),
        autoProperty = new Pro.AutoProperty(obj, 'ap'),
        objectProperty = new Pro.ObjectProperty(obj, 'op');

    expect(obj.ap).toEqual(obj.a + obj.op.b);

    obj.op.b = 3;
    expect(obj.ap).toEqual(obj.a + obj.op.b);

    obj.a = 2;
    expect(obj.ap).toEqual(obj.a + obj.op.b);
  });

});
