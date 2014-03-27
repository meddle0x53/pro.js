'use strict';

describe('Pro.Property', function () {
  var obj;
  beforeEach(function () {
    obj = {a: 'my val'};
  });

  describe('#constructor', function () {

    it('initializes the property', function () {
      var property = new Pro.Property(obj, 'a');
      expect(property.state).toEqual(Pro.States.ready);
    });

    it('doesn\'t change the object structure.', function () {
      var property = new Pro.Property(obj, 'a');
      expect(obj.a).toEqual('my val');
    });

    it('stores the property in the proObject', function () {
      var property = new Pro.Property(obj, 'a');
      expect(property).toEqual(obj.__pro__.properties.a);
    });

    it('passing a getter can override a propertie value', function () {
      var property = new Pro.Property(obj, 'a', function () {
        return 70;
      });
      expect(obj.a).toEqual(70);
    });

  });

  describe('#destroy', function () {
    it('destroys the property', function () {
      var property = new Pro.Property(obj, 'a');
      property.destroy();
      expect(property.state).toEqual(Pro.States.destroyed);
    });

    it('doesn\'t change the object structure.', function () {
      var property = new Pro.Property(obj, 'a');
      property.destroy();
      expect(obj.a).toEqual('my val');
    });
  });

  describe('#get', function () {
    it('is the same as getting the original value', function () {
      var property = new Pro.Property(obj, 'a');
      expect(property.get()).toEqual(obj.a);
    });

    it('has the alias "g"', function () {
      var property = new Pro.Property(obj, 'a');
      expect(property.g).toBe(property.get);
    });

    it('adds listener for the current caller', function () {
      var property = new Pro.Property(obj, 'a');
      obj.__pro__.currentCaller = 'b';
      obj.__pro__.originals = {
        b: function () {
          return this.a + ' is cool';
        }
      };
      property.get();
      obj.__pro__.currentCaller = null;
      expect(property.listeners.length).toBe(1);

      property.notifyAll();
      expect(obj.b).toEqual('my val is cool');
    });
  });

  describe('#set', function () {
    it('it changes the original value', function () {
      var property = new Pro.Property(obj, 'a');
      property.set(5);
      expect(obj.a).toEqual(5);
    });

    it('has the alias "s"', function () {
      var property = new Pro.Property(obj, 'a');
      expect(property.s).toBe(property.set);
    });

    it('notifies the listeners of the property', function () {
      var property = new Pro.Property(obj, 'a');
      spyOn(property, 'notifyAll');
      property.set(3);

      expect(property.notifyAll).toHaveBeenCalled();
    });
  });
});

