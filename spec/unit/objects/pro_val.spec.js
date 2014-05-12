'use strict';

describe('Pro.Val', function () {

  describe('#constructor', function () {
    it ('constructs a Pro object with only one property - v', function () {
      var val = new Pro.Val(3);

      expect(Pro.Utils.isProObject(val)).toBe(true);
      expect(val.v).toBe(3);
    });
  });

  describe('#type', function () {
    it('returns the right type, depending on the value', function () {
      var val = new Pro.Val(3);

      expect(val.type()).toBe(Pro.Property.Types.simple);
    });
  });

});
