var _ = require("lodash");

function Reflection() {
}

Reflection.visitObject = function (obj, visitor, maxDepth) {
    maxDepth = maxDepth || 5;

    if (!_.isObject(obj)) throw  new TypeError("Argument 'obj' is not an object.");
    if (!_.isFunction(visitor)) throw  new TypeError("Argument 'visitor' is not a function.");
    if (!_.isNumber(maxDepth)) throw  new TypeError("Argument 'maxDepth' is not a number.");

    function doVisit(obj, visitor, maxDepth, currLevel) {
        if (currLevel <= maxDepth && visitor(obj) && _.isObject(obj)) {
            _.mapValues(obj, function(inObj) {
                doVisit(inObj, visitor, maxDepth, currLevel + 1);
            });
        }
    }

    doVisit(obj, visitor, maxDepth, 1);
};

module.exports = Reflection;
