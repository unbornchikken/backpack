"use strict";
var _ = require("lodash");
function Reflection() {}
Reflection.visitObject = function(obj, visitor, maxDepth) {
  maxDepth = maxDepth || 5;
  if (!_.isObject(obj)) {
    throw new TypeError("Argument 'obj' is not an object.");
  }
  if (!_.isFunction(visitor)) {
    throw new TypeError("Argument 'visitor' is not a function.");
  }
  if (!_.isNumber(maxDepth)) {
    throw new TypeError("Argument 'maxDepth' is not a number.");
  }
  function doVisit(_obj, _visitor, _maxDepth, currLevel, parent, key) {
    if (_.isUndefined(parent)) {
      parent = null;
    }
    if (_.isUndefined(key)) {
      key = null;
    }
    if (currLevel <= _maxDepth && _visitor(_obj, parent, key)) {
      if (_.isPlainObject(_obj) || _.isArray(_obj)) {
        for (var _key in _obj) {
          doVisit(_obj[_key], _visitor, _maxDepth, currLevel + 1, _obj, _key);
        }
      }
    }
  }
  doVisit(obj, visitor, maxDepth, 1);
};
module.exports = Reflection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlZmxlY3Rpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFFQSxBQUFJLEVBQUEsQ0FBQSxDQUFBLEVBQUksQ0FBQSxPQUFNLEFBQUMsQ0FBQyxRQUFPLENBQUMsQ0FBQztBQUV6QixPQUFTLFdBQVMsQ0FBRSxBQUFELENBQUcsR0FDdEI7QUFBQSxBQUVBLFNBQVMsWUFBWSxFQUFJLFVBQVUsR0FBRSxDQUFHLENBQUEsT0FBTSxDQUFHLENBQUEsUUFBTyxDQUFHO0FBQ3ZELFNBQU8sRUFBSSxDQUFBLFFBQU8sR0FBSyxFQUFBLENBQUM7QUFFeEIsS0FBSSxDQUFDLENBQUEsU0FBUyxBQUFDLENBQUMsR0FBRSxDQUFDLENBQUc7QUFDbEIsUUFBTSxJQUFJLFVBQVEsQUFBQyxDQUFDLGtDQUFpQyxDQUFDLENBQUM7RUFDM0Q7QUFBQSxBQUNBLEtBQUksQ0FBQyxDQUFBLFdBQVcsQUFBQyxDQUFDLE9BQU0sQ0FBQyxDQUFHO0FBQ3hCLFFBQU0sSUFBSSxVQUFRLEFBQUMsQ0FBQyx1Q0FBc0MsQ0FBQyxDQUFDO0VBQ2hFO0FBQUEsQUFDQSxLQUFJLENBQUMsQ0FBQSxTQUFTLEFBQUMsQ0FBQyxRQUFPLENBQUMsQ0FBRztBQUN2QixRQUFNLElBQUksVUFBUSxBQUFDLENBQUMsc0NBQXFDLENBQUMsQ0FBQztFQUMvRDtBQUFBLEFBRUEsU0FBUyxRQUFNLENBQUUsSUFBRyxDQUFHLENBQUEsUUFBTyxDQUFHLENBQUEsU0FBUSxDQUFHLENBQUEsU0FBUSxDQUFHLENBQUEsTUFBSyxDQUFHLENBQUEsR0FBRSxDQUFHO0FBQ2hFLE9BQUksQ0FBQSxZQUFZLEFBQUMsQ0FBQyxNQUFLLENBQUMsQ0FBRztBQUN2QixXQUFLLEVBQUksS0FBRyxDQUFDO0lBQ2pCO0FBQUEsQUFDQSxPQUFJLENBQUEsWUFBWSxBQUFDLENBQUMsR0FBRSxDQUFDLENBQUc7QUFDcEIsUUFBRSxFQUFJLEtBQUcsQ0FBQztJQUNkO0FBQUEsQUFDQSxPQUFJLFNBQVEsR0FBSyxVQUFRLENBQUEsRUFBSyxDQUFBLFFBQU8sQUFBQyxDQUFDLElBQUcsQ0FBRyxPQUFLLENBQUcsSUFBRSxDQUFDLENBQUc7QUFDdkQsU0FBSSxDQUFBLGNBQWMsQUFBQyxDQUFDLElBQUcsQ0FBQyxDQUFBLEVBQUssQ0FBQSxDQUFBLFFBQVEsQUFBQyxDQUFDLElBQUcsQ0FBQyxDQUFHO0FBQzFDLHVCQUFpQixLQUFHLENBQUc7QUFDbkIsZ0JBQU0sQUFBQyxDQUFDLElBQUcsQ0FBRSxJQUFHLENBQUMsQ0FBRyxTQUFPLENBQUcsVUFBUSxDQUFHLENBQUEsU0FBUSxFQUFJLEVBQUEsQ0FBRyxLQUFHLENBQUcsS0FBRyxDQUFDLENBQUM7UUFDdkU7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxBQUVBLFFBQU0sQUFBQyxDQUFDLEdBQUUsQ0FBRyxRQUFNLENBQUcsU0FBTyxDQUFHLEVBQUEsQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFFRCxLQUFLLFFBQVEsRUFBSSxXQUFTLENBQUM7QUFDM0IiLCJmaWxlIjoic3lzdGVtL3JlZmxlY3Rpb24uanMiLCJzb3VyY2VSb290IjoibGliL2VzNiIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xyXG5cclxubGV0IF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xyXG5cclxuZnVuY3Rpb24gUmVmbGVjdGlvbigpIHtcclxufVxyXG5cclxuUmVmbGVjdGlvbi52aXNpdE9iamVjdCA9IGZ1bmN0aW9uIChvYmosIHZpc2l0b3IsIG1heERlcHRoKSB7XHJcbiAgICBtYXhEZXB0aCA9IG1heERlcHRoIHx8IDU7XHJcblxyXG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQXJndW1lbnQgJ29iaicgaXMgbm90IGFuIG9iamVjdC5cIik7XHJcbiAgICB9XHJcbiAgICBpZiAoIV8uaXNGdW5jdGlvbih2aXNpdG9yKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcmd1bWVudCAndmlzaXRvcicgaXMgbm90IGEgZnVuY3Rpb24uXCIpO1xyXG4gICAgfVxyXG4gICAgaWYgKCFfLmlzTnVtYmVyKG1heERlcHRoKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBcmd1bWVudCAnbWF4RGVwdGgnIGlzIG5vdCBhIG51bWJlci5cIik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZG9WaXNpdChfb2JqLCBfdmlzaXRvciwgX21heERlcHRoLCBjdXJyTGV2ZWwsIHBhcmVudCwga2V5KSB7XHJcbiAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQocGFyZW50KSkge1xyXG4gICAgICAgICAgICBwYXJlbnQgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZChrZXkpKSB7XHJcbiAgICAgICAgICAgIGtleSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjdXJyTGV2ZWwgPD0gX21heERlcHRoICYmIF92aXNpdG9yKF9vYmosIHBhcmVudCwga2V5KSkge1xyXG4gICAgICAgICAgICBpZiAoXy5pc1BsYWluT2JqZWN0KF9vYmopIHx8IF8uaXNBcnJheShfb2JqKSkge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgX2tleSBpbiBfb2JqKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZG9WaXNpdChfb2JqW19rZXldLCBfdmlzaXRvciwgX21heERlcHRoLCBjdXJyTGV2ZWwgKyAxLCBfb2JqLCBfa2V5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkb1Zpc2l0KG9iaiwgdmlzaXRvciwgbWF4RGVwdGgsIDEpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSZWZsZWN0aW9uO1xyXG4iXX0=