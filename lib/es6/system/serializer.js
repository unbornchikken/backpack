"use strict";

/* jshint -W061 */

let _ = require("lodash");

function Serializer(options) {
    this.options = {
        ignoreNativeFunc: true
    };
    if (options !== undefined) {
        _.extend(this.options, options);
    }
    this._knonwTypes = {};
    this._registerDefaultKnownTypes();
}

Serializer.prototype._registerDefaultKnownTypes = function () {
    this.registerKnownType("Map", Map);
    this.registerKnownType("Set", Set);
};

Serializer.prototype.registerKnownType = function (typeName, type) {
    if (!_.isString(typeName)) {
        throw new TypeError("Parameter 'alias' is not a string.");
    }
    if (!type) {
        throw new Error("Argument 'type' is expected.");
    }
    let typeOfType = typeof type;
    switch (typeOfType) {
        case "string":
            type = require(type);
            break;
        case "function":
            break;
        default :
            throw new TypeError("Argument 'type' value is unrecognised.");
    }
    if (_.isUndefined(type.prototype)) {
        throw new TypeError("Argument 'type' is not a constructor.");
    }
    this._knonwTypes[typeName] = type.prototype;
};

Serializer.prototype._setTypeTag = function (outputObj, obj) {
    if (obj.constructor && obj.constructor !== Object) {
        for (let n in this._knonwTypes) {
            let v = this._knonwTypes[n];
            if (v === obj.constructor.prototype) {
                outputObj[Serializer.TYPETAG] = n;
                return;
            }
        }
    }
};

Serializer.prototype._setProto = function (obj, typeTag) {
    typeTag = typeTag || obj[Serializer.TYPETAG];
    if (typeTag) {
        let type = this._knonwTypes[typeTag];
        if (_.isUndefined(type)) {
            throw new Error("Type '" + typeTag + "' has not been registered.");
        }
        Object.setPrototypeOf(obj, type);
        delete obj[Serializer.TYPETAG];
    }
};

Serializer.prototype.stringify = function (obj) {
    let json = this.toJSON(obj);
    return _.isNull(json) ? null : JSON.stringify(json);
};

Serializer.prototype.toJSON = function (obj) {
    if (_.isUndefined(obj)) {
        throw new Error("Argument expected.");
    }
    if (_.isNull(obj)) {
        return null;
    }

    return this._serialize(obj, new Map(), []);
};

Serializer.prototype._serialize = function (obj, cache, path) {
    if (typeof obj === "object") {
        cache.set(obj, path);

        let toJSON = false;
        let pObj = obj;

        let serializeToJSON = obj.serializeToJSON || obj._serializeToJSON;
        if (_.isFunction(serializeToJSON) && (_.isFunction(obj.deserializeFromJSON) || _.isFunction(obj._deserializeFromJSON))) {
            obj = serializeToJSON.call(obj);
            if (!_.isObject(obj) || _.isArray(obj)) {
                throw new Error(pObj.constructor.name + ".serializeToJSON has returned not an object.");
            }
            toJSON = true;
        }

        if (obj instanceof Map) {
            let data = { data: [] };
            for (let kvp of obj.entries()) {
                data.data.push(kvp);
            }
            obj = data;
            toJSON = true;
        }

        if (obj instanceof Set) {
            let data = { data: [] };
            for (let value of obj.values()) {
                data.data.push(value);
            }
            obj = data;
            toJSON = true;
        }

        let outputObj = Array.isArray(obj) ? [] : {};
        if (toJSON) {
            outputObj[Serializer.TOJSONTAG] = true;
        }

        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                let subObject = obj[key];
                let typeOfSubObject = typeof subObject;
                if (typeOfSubObject === "object" && subObject !== null) {
                    let found = false;
                    let subObjectPath = cache.get(subObject);
                    if (!_.isUndefined(subObjectPath)) {
                        let pathMarker = {};
                        pathMarker[Serializer.CIRCULARFLAG] = subObjectPath;
                        outputObj[key] = pathMarker;
                        found = true;
                    }
                    if (!found) {
                        let newPath = path.slice(0);
                        newPath.push(key);
                        outputObj[key] = this._serialize(subObject, cache, newPath);
                    }
                }
                else if (typeOfSubObject === "function") {
                    let funcStr = subObject.toString();
                    if (Serializer.ISNATIVEFUNC.test(funcStr)) {
                        if (this.options.ignoreNativeFunc) {
                            funcStr = "function() {throw new Error('Call a native function unserialized')}";
                        }
                        else {
                            throw new Error("Can't serialize a object with a native function property.");
                        }
                    }
                    outputObj[key] = Serializer.FUNCFLAG + funcStr;
                }
                else {
                    outputObj[key] = subObject;
                }
            }
        }

        this._setTypeTag(outputObj, pObj);

        return outputObj;
    }
    else {
        return obj;
    }
};

Serializer.prototype.parse = function (str) {
    if (_.isUndefined(str)) {
        throw new Error("Argument expected.");
    }
    if (_.isNull(str)) {
        return null;
    }
    if (!_.isString(str)) {
        throw new TypeError("Argument is not a string.");
    }

    return this.fromJSON(JSON.parse(str));
};

Serializer.prototype.fromJSON = function (json) {
    if (_.isUndefined(json)) {
        throw new Error("Argument expected.");
    }
    if (_.isNull(json)) {
        return null;
    }

    return this._unserialize(json);
};

Serializer.prototype._unserialize = function (obj, originObj, circularTasks) {
    if (typeof obj === "object") {
        originObj = originObj || obj;
        circularTasks = circularTasks || [];

        let result = null;
        let fromJSON = false;
        if (obj !== null) {
            fromJSON = obj[Serializer.TOJSONTAG] === true;
            result = Array.isArray(obj) ? [] : {};
            for (let key in obj) {
                if (key !== Serializer.TOJSONTAG) {
                    let subObject = obj[key];
                    let typeOfSubObj = typeof subObject;
                    if (typeOfSubObj === "object") {
                        let circPath = subObject && subObject[Serializer.CIRCULARFLAG];
                        if (Array.isArray(circPath)) {
                            result[key] = circPath;
                            circularTasks.push({ obj: result, key: key });
                        }
                        else {
                            result[key] = this._unserialize(subObject, originObj, circularTasks);
                        }
                    }
                    else if (typeOfSubObj === "string") {
                        if (subObject.indexOf(Serializer.FUNCFLAG) === 0) {
                            result[key] = eval("(" + subObject.substring(Serializer.FUNCFLAG.length) + ")").bind(result);
                        }
                        else {
                            result[key] = subObject;
                        }
                    }
                    else {
                        result[key] = subObject;
                    }
                }
            }
        }

        if (originObj === obj) {
            circularTasks.forEach(
                function (task) {
                    task.obj[task.key] = Serializer._getKeyPath(result, task.obj[task.key]);
                });
        }

        if (result !== null) {
            if (fromJSON) {
                let type = result[Serializer.TYPETAG];
                if (type === "Map") {
                    let map = new Map();
                    for (let kvp of result.data) {
                        map.set(kvp[0], kvp[1]);
                    }
                    return map;
                }
                else if (type === "Set") {
                    let set = new Set();
                    for (let value of result.data) {
                        set.add(value);
                    }
                    return set;
                }
                else {
                    let realResult = {};
                    this._setProto(realResult, result[Serializer.TYPETAG]);
                    let deserializeFromJSON = realResult.deserializeFromJSON || realResult._deserializeFromJSON;
                    if (_.isFunction(deserializeFromJSON)) {
                        deserializeFromJSON.call(realResult, result);
                    }
                    else {
                        throw new Error(result.constructor.name + ".deserializeFromJSON function not found.");
                    }
                    return realResult;
                }
            }
            else {
                if (typeof result === "object") {
                    this._setProto(result);
                }
            }
        }

        return result;
    }
    else {
        return obj;
    }
};

Serializer._getKeyPath = function (originObj, path) {
    let currentObj = originObj;
    path.forEach(
        function (p, index) {
            currentObj = currentObj[p];
        });
    return currentObj;
};

Serializer.FUNCFLAG = "_$$ND_FUNC$$_";
Serializer.CIRCULARFLAG = "_$$ND_CC$$_";
Serializer.TYPETAG = "_$$TAG_TYPE$$_";
Serializer.TOJSONTAG = "_$$TAG_TOJSON$$_";
Serializer.ISNATIVEFUNC = /^function\s*[^(]*\(.*\)\s*\{\s*\[native code\]\s*\}$/;

module.exports = Serializer;