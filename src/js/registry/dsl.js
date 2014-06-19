Pro.DSL = {
  separator: '|',
  ops: {
    into: {
      sym: '<<',
      match: function (op) {
        return op.substring(0, 2) === Pro.DSL.ops.into.sym;
      },
      toOptions: function (actionObject, op) {
        actionObject.into = op.substring(2);
      },
      action: function (object, actionObject) {
        if (!actionObject || !actionObject.into) {
          return object;
        }

        return object.into(actionObject.into);
      }
    }
  }
};
