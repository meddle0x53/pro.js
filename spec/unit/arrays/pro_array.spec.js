'use strict';

describe('Pro.Array', function () {
  it('is array-like object', function () {
    var array = new Pro.Array(3, 4, 5);

    console.log(array.length);
    console.log(array.concat(6, 7).length);

  });

});
