"use strict";

let _ = require("lodash");

function Reflection() {
}

Reflection.visitObject = function (obj, visitor, maxDepth) {
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
                for (let _key in _obj) {
                    doVisit(_obj[_key], _visitor, _maxDepth, currLevel + 1, _obj, _key);
                }
            }
        }
    }

    doVisit(obj, visitor, maxDepth, 1);
};

module.exports = Reflection;
