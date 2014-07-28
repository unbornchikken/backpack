var Map = require("../collections/map");
var StrMap = require("../collections/strMap");
var Set = require("../collections/set");
var StrSet = require("../collections/strSet");
var Bag = require("../collections/bag");
var StrBag = require("../collections/strBag");
var _ = require("lodash");

function Serializer(options)
{
    this.options = {
        ignoreNativeFunc: true
    };
    if (options !== undefined) _.extend(this.options, options);
    this._knonwTypes = {};
    this._registerDefaultKnownTypes();
}

Serializer.prototype._registerDefaultKnownTypes = function()
{
    this.registerKnownType("backpack.collections.Map", Map);
    this.registerKnownType("backpack.collections.StrMap", StrMap);
    this.registerKnownType("backpack.collections.Set", Set);
    this.registerKnownType("backpack.collections.StrSet", StrSet);
    this.registerKnownType("backpack.collections.Bag", Bag);
    this.registerKnownType("backpack.collections.StrBag", StrBag);
}

Serializer.prototype.registerKnownType = function (typeName, type)
{
    if (!_.isString(typeName)) throw new TypeError("Parameter 'alias' is not a string.");
    if (!type) throw new Error("Argument 'type' is expected.");
    var typeOfType = typeof type;
    switch  (typeOfType)
    {
        case "string":
            type = require(type);
            break;
        case "function":
            break;
        default :
            throw new TypeError("Argument 'type' value is unrecognised.");
    }
    if (_.isUndefined(type.prototype)) throw new TypeError("Argument 'type' is not a constructor.");
    this._knonwTypes[typeName] = type.prototype;
};

Serializer.prototype._setTypeTag = function (outputObj, obj)
{
    if (obj.constructor && obj.constructor !== Object)
    {
        for (var n in this._knonwTypes)
        {
            var v = this._knonwTypes[n];
            if (v === obj.constructor.prototype)
            {
                outputObj[Serializer.TYPETAG] = n;
                return;
            }
        }
    }
};

Serializer.prototype._setProto = function (obj, typeTag)
{
    typeTag = typeTag || obj[Serializer.TYPETAG];
    if (typeTag)
    {
        var type = this._knonwTypes[typeTag];
        if (_.isUndefined(type)) throw new Error("Type '" + typeTag + "' has not been registered.");
        obj.__proto__ = type;
        delete obj[Serializer.TYPETAG];
    }
};

Serializer.prototype.stringify = function (obj)
{
    var json = this.toJSON(obj);
    return _.isNull(json) ? null : JSON.stringify(json);
};

Serializer.prototype.toJSON = function (obj)
{
    if (_.isUndefined(obj)) throw new Error("Argument expected.");
    if (_.isNull(obj)) return null;

    return this._serialize(obj, new Map({ forceES6Map: true }), []);
};

Serializer.prototype._serialize = function (obj, cache, path)
{
    if (typeof obj === "object")
    {
        cache.add(obj, path);

        var toJSON = false;
        var pObj = obj;
        var serializeToJSON = obj["serializeToJSON"] || obj["_serializeToJSON"];
        if (_.isFunction(serializeToJSON) && (_.isFunction(obj["deserializeFromJSON"]) || _.isFunction(obj["_deserializeFromJSON"])))
        {
            obj = serializeToJSON.call(obj);
            if (!_.isObject(obj) || _.isArray(obj)) throw Error(pObj.constructor.name + ".serializeToJSON has returned not an object.");
            toJSON = true;
        }

        var outputObj = Array.isArray(obj) ? [] : {};
        if (toJSON) outputObj[Serializer.TOJSONTAG] = true;

        for (var key in obj)
        {
            if (obj.hasOwnProperty(key))
            {
                var subObject = obj[key];
                var typeOfSubObject = typeof subObject;
                if (typeOfSubObject === "object" && subObject !== null)
                {
                    var found = false;
                    var subObjectPath = cache.get(subObject);
                    if (!_.isUndefined(subObjectPath))
                    {
                        var pathMarker = {};
                        pathMarker[Serializer.CIRCULARFLAG] = subObjectPath;
                        outputObj[key] = pathMarker;
                        found = true;
                    }
                    if (!found)
                    {
                        var newPath = path.slice(0);
                        newPath.push(key);
                        outputObj[key] = this._serialize(subObject, cache, newPath);
                    }
                }
                else if (typeOfSubObject === "function")
                {
                    var funcStr = subObject.toString();
                    if (Serializer.ISNATIVEFUNC.test(funcStr))
                    {
                        if (this.options.ignoreNativeFunc)
                        {
                            funcStr = "function() {throw new Error('Call a native function unserialized')}";
                        }
                        else
                        {
                            throw new Error("Can't serialize a object with a native function property.");
                        }
                    }
                    outputObj[key] = Serializer.FUNCFLAG + funcStr;
                }
                else
                {
                    outputObj[key] = subObject;
                }
            }
        }

        this._setTypeTag(outputObj, pObj);

        return outputObj;
    }
    else
    {
        return obj;
    }
};

Serializer.prototype.parse = function (str)
{
    if (_.isUndefined(str)) throw new Error("Argument expected.");
    if (_.isNull(str)) return null;
    if (!_.isString(str)) throw new TypeError("Argument is not a string.");

    return this.fromJSON(JSON.parse(str));
};

Serializer.prototype.fromJSON = function (json)
{
    if (_.isUndefined(json)) throw new Error("Argument expected.");
    if (_.isNull(json)) return null;

    return this._unserialize(json);
};

Serializer.prototype._unserialize = function (obj, originObj, circularTasks)
{
    if (typeof obj === "object")
    {
        originObj = originObj || obj;
        circularTasks = circularTasks || [];

        var result = null;
        if (obj !== null)
        {
            var fromJSON = obj[Serializer.TOJSONTAG] === true;
            result = Array.isArray(obj) ? [] : {};
            for (var key in obj)
            {
                if (key != Serializer.TOJSONTAG)
                {
                    var subObject = obj[key];
                    var typeOfSubObj = typeof subObject;
                    if (typeOfSubObj === "object")
                    {
                        var circPath = subObject && subObject[Serializer.CIRCULARFLAG];
                        if (Array.isArray(circPath))
                        {
                            result[key] = circPath;
                            circularTasks.push({obj: result, key: key});
                        }
                        else
                        {
                            result[key] = this._unserialize(subObject, originObj, circularTasks);
                        }
                    }
                    else if (typeOfSubObj === "string")
                    {
                        if (subObject.indexOf(Serializer.FUNCFLAG) === 0)
                        {
                            result[key] = eval("(" + subObject.substring(Serializer.FUNCFLAG.length) + ")").bind(result);
                        }
                        else
                        {
                            result[key] = subObject;
                        }
                    }
                    else
                    {
                        result[key] = subObject;
                    }
                }
            }
        }

        if (originObj === obj)
        {
            circularTasks.forEach(
                function (task)
                {
                    task.obj[task.key] = Serializer._getKeyPath(result, task.obj[task.key]);
                });
        }

        if (result !== null)
        {
            if (fromJSON)
            {
                var realResult = {};
                this._setProto(realResult, result[Serializer.TYPETAG]);
                var deserializeFromJSON = realResult["deserializeFromJSON"] || realResult["_deserializeFromJSON"];
                if (_.isFunction(deserializeFromJSON))
                {
                    deserializeFromJSON.call(realResult, result);
                }
                else
                {
                    throw new Error(result.constructor.name + ".deserializeFromJSON function not found.");
                }
                return realResult;
            }
            else
            {
                if (typeof result === "object") this._setProto(result);
            }
        }

        return result;
    }
    else
    {
        return obj;
    }
};

Serializer._getKeyPath = function (originObj, path)
{
    var currentObj = originObj;
    path.forEach(
        function (p, index)
        {
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