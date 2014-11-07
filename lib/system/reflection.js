var _ = require("lodash");

function Reflection() {
}

Reflection.visitObject = function (obj, visitor, maxDepth) {
    maxDepth = maxDepth || 5;

    if (!_.isObject(obj)) throw  new TypeError("Argument 'obj' is not an object.");
    if (!_.isFunction(visitor)) throw  new TypeError("Argument 'visitor' is not a function.");
    if (!_.isNumber(maxDepth)) throw  new TypeError("Argument 'maxDepth' is not a number.");

    function doVisit(obj, visitor, maxDepth, currLevel, parent, key) {
        if (_.isUndefined(parent)) parent = null;
        if (_.isUndefined(key)) key = null;
        if (currLevel <= maxDepth && visitor(obj, parent, key) && _.isObject(obj)) {
            _.keys(obj).forEach(function(key) {
                doVisit(obj[key], visitor, maxDepth, currLevel + 1, obj, key);
            });
        }
    }

    doVisit(obj, visitor, maxDepth, 1);
};

module.exports = Reflection;
