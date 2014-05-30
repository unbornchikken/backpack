# Backpack

![Backpack](http://4.bp.blogspot.com/-HWzrWGNMwGA/T9adhLWLaZI/AAAAAAAADsY/2TRrMuYUMWM/s1600/acw_how-to-draw-backpack-from-dora-the-explorer-tutorial-drawing.jpeg)

Class library of useful things for Node.js

## Purpose

The aim of this library is to provide a collection of classes in one place like those can be found in other frameworks, 
but are not bundled in Node.js, even are not exists on the npm.org.

## Collections

All hashed collections are missing from JavaScript. You can create an object, and then put it some other objects keyed by string values, but that's it,
 you cannot use keys other than strings.

There are some already implemented solutions for this, like: [hashmap](https://www.npmjs.org/package/hashmap) or [hashtable](https://www.npmjs.org/package/hashtable).
The problem is those are either native libraries which often banned from mayor cloud platforms, or if implemented in pure JS they will mutate keys which 
[seriously hurts V8 performance optimizations](http://www.html5rocks.com/en/tutorials/speed/v8/).

Backpack is a pure JS module and Backpack Collections **won't mutate keys**, yet you can use *any* object for keys in classes where appropriate.

### Map

Usage:

```javascript
var Map = require("backpack").collections.Map;
var myMap = new Map();
myMap.add(1, "a");
```

