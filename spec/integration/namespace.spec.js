'use strict';

describe('Pro', function () {
  it ('exists in the global object', function () {
    expect(Pro).not.toBe(undefined);
    expect(Pro).not.toBe(null);
    expect(typeof(Pro)).toBe('object');
  });

  describe('#prob', function () {
    it ('exists in the namespace', function () {
      expect(Pro.prob).not.toBe(undefined);
      expect(Pro.prob).not.toBe(null);
      expect(typeof(Pro.prob)).toBe('function');
    });

    it ('turns normal js object into Pro Object (object with properties)', function () {
      var obj = {
        a: [1, 2, 3],
        b: function () {
          return a.length;
        }
      };

      Pro.prob(obj);
      expect(obj.__pro__).not.toBe(undefined);
      expect(obj.__pro__).not.toBe(null);
      expect(typeof(obj.__pro__)).toBe('object');
    });
  });

});
