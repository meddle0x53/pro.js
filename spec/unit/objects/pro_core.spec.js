'use strict';

describe('Pro.Core', function () {
  describe('#set', function () {
    it ('sets present properties to new values', function () {
      var obj = {
            a:1
          },
          core = new Pro.Core(obj);
      obj.__pro__ = core;
      core.makeProp('a');

      core.set('a', 7);
      expect(obj.a).toEqual(7);
    });

    it ('adds non-present properties to the main object of the Pro.Core', function () {
      var obj = {
            a:1
          },
          core = new Pro.Core(obj);
      obj.__pro__ = core;
      core.makeProp('a');

      core.set('b', 3);
      expect(core.properties.b).not.toBe(undefined);
      expect(core.properties.b.type()).toBe(Pro.Property.Types.simple);
      expect(obj.b).toEqual(3);

      core.set('c', function () {
        return this.a + this.b;
      });
      expect(core.properties.c).not.toBe(undefined);
      expect(core.properties.c.type()).toBe(Pro.Property.Types.auto);
      expect(obj.c).toEqual(4);

      obj.a = 6;
      expect(obj.c).toEqual(9);
    });
  });
});
