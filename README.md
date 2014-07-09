# Pro.js is ProAct.js as of today - 10.07.2014!
  The project is renamed and permanently moved to [https://github.com/proactjs/proactjs](https://github.com/proactjs/proactjs)

## pro.js [![GitHub version](https://badge.fury.io/gh/meddle0x53%2Fpro.js.svg)](http://badge.fury.io/gh/meddle0x53%2Fpro.js) [![Build Status](https://travis-ci.org/meddle0x53/pro.js.svg?branch=master)](https://travis-ci.org/meddle0x53/pro.js)



## Download
 * [Development](https://raw.github.com/meddle0x53/pro.js/master/dist/js/pro.js)
 * [Production](https://raw.github.com/meddle0x53/pro.js/master/dist/js/pro.min.js)

## About pro.js
  Reactive JavaScript object properties. In other words object oriented implementation of the [Reactive paradigm in the programming](http://en.wikipedia.org/wiki/Reactive_programming) in Javascript.
  In human language the reactive idea is the following: if we define sum=a+b and we change 'a' or 'b', 'sum' is automatically calculated.
  The library can be used to implement fast model layer for a small JS MVC (the reactive nature of pro.js gives you bindings). It can be used for observing changes on properties too.
  See the 'Examples' section.


### Compatibility 
  Pro.js is compatible with all the ECMAScript 5 browsers.
  For example Google's Chrome, Mozilla's Firefox, Apple's Safari, Opera, and the newest IEs - 10 and 11 (Tested with chrome and firefox, will be tested agains the others soon).
  
### Use in sites
```html
  <script src="pro.js" type="text/javascript"></script>
  <!-- Pro will be global object -->
```
or
```html
  <script src="pro.min.js" type="text/javascript"></script>
  <!-- Pro will be global object -->
```

### Use as Node.js module [![NPM version](https://badge.fury.io/js/pro.js.svg)](http://badge.fury.io/js/pro.js)
```
  npm install pro.js
```

```javascript
  var Pro = require('pro.js');
```

### Build from source
  * Install Node.js and its package manager 'npm'
  * Clone or fork and clone this project - for example ```git clone https://github.com/meddle0x53/pro.js.git```
  * Go to the clonned project and run ``` npm install ``` to install the project dependencies. 
  * Run ``` grunt spec ``` to run the specs, should pass.
  * Run ``` grunt build ``` to build the project - the build will be located in ``` {project_folder}/dist ```

## Examples

### The reactive sum:

Let's say we want to define sum=a+b. We want whenever 'a' or 'b' changes, 'sum' to be updated automatically.
'Pro.prob' accepts a normal javascript object and returns a Pro Object. All the functions of the initial object are simple fields in the Pro Object, but they are computed using the original function. If something that the original function is depending on, changes, the value of the corresponding field is changed. So the implementation of the 'sum' is:
```javascript
  var obj = Pro.prob({
    a: 4,
    b: 3,
    sum: function () {
      return this.a + this.b;
    }
  });  // Make obj Pro Object (object with reactive properties).
  
  console.log(typeof(obj.sum)); // "number"
  console.log(obj.sum); // sum is simple field now and it is 7
  obj.a = 5;
  console.log(obj.sum); // sum is 8
  obj.b = 25;
  console.log(obj.sum); // sum is 30
```
Now. What about a sum of all the array's elements:
```javascript
  var obj = Pro.prob({
    a: [1, 2, 3, 4, 5],
    sum: function () {
      var result = 0, i, ln = this.a.length;
      
      for (i = 0; i < ln; i++) {
        result += this.a[i];
      }
      
      return result;
    }
  });  // Make obj Pro Object (object with reactive properties).
  
  console.log(typeof(obj.sum)); // "number"
  console.log(obj.sum); // sum is simple field now and it is 1 + 2 + 3 + 4 + 5 = 15
  obj.a.push(6);
  console.log(obj.sum); // sum is 21
  obj.a.shift();
  console.log(obj.sum); // sum is 20
```

### Observing
Of course we can use the reactive properties of an object to observe changes. I am going to implement the first example of [Watch.js](https://github.com/melanke/Watch.JS/), using a smart pro object.

```javascript
  var obj = Pro.prob({
    a: "initial value of a",
    aWatcher: function () {
      var newVal = this.a;
      if (newVal !== "initial value of a") {
        alert("a changed to " + newVal);
      }
    }
  });
  obj.aWatcher; // The computed properties are lazy so, initialize the watcher first.
  
  obj.a = "other value"; // We will see the alert.
```

This can be accomplished by adding listeners to a property too:

```javascript
  var obj = Pro.prob({
    a: "initial value of a"
  });
  
  obj.p('a').on(function (e) {
    alert("a changed to " + obj.a);
  });
  
  obj.a = 'GO!'; // We will see the alert. This is the right method for obsserving btw :)
```

### Streaming

Here is an example for implementation of click counter using Pro.Val and streams for click events:
[fiddle](http://jsfiddle.net/meddle/2Wrfq/)

