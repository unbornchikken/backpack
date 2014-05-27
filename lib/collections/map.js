var _ = require("underscore-node");

/*Equatable*/

function Equatable(obj)
{
    this._obj = obj;
    if (!_.isFunction(this._obj_equals = obj["equals"])) this._obj_equals = false;
}

Object.defineProperties(
    Equatable.prototype, {
        obj: {
            get: function ()
            {
                return this._obj;
            }
        }
    });

Equatable.prototype.equals = function (other)
{
    if (this._obj_equals) return this._obj_equals.call(this._obj, other);
    return this === other;
}

/* Map */

function Map()
{
    this._buckets = {};
    this._length = 0;
}

Map.OBJSTRING = "[object Object]";
Map.NULL = "#$@%TRQg";
Map.UNDEFINED = "#$@%TRQa";
Map.ARRAY = "#$@%TRQw";
Map.OBJECT = "#$@%TRQe";
Map.MAXKEYLENGTH = 256;
Map.MAXLEVEL = 2;

Object.defineProperties(
    Map.prototype, {
        length: {
            get: function ()
            {
                return this._length;
            }
        }
    });

Map.prototype.add = function (key, value)
{
    this.set(key, value, true);
}

Map.prototype.set = function (key, value, throwIfExists)
{
    if (value === null) throw new TypeError("Argument 'value' is null.");

    var bKey = this._genKey(key);

    var bucket = this._buckets[bKey];
    if (!bucket)
    {
        bucket = [ {
            key: new Equatable(key),
            value: value
        } ];
        this._buckets[bKey] = bucket;
    }
    else
    {
        var found = null;

        bucket.forEach(
            function (e)
            {
                if (e.key.equals(value))
                {
                    found = e;
                    return false;
                }
            });

        if (found)
        {
            if (throwIfExists) throw new Error("Item by key already exists.");
            found.value = value;
        }
        else
        {
            bucket.push({
                key: new Equatable(key),
                value: value
            });
        }
    }
}

Map.prototype.get = function(key)
{
    var bKey = this._genKey(key);
    var bucket = this._buckets[bKey];
    if (bucket)
    {
        if (bucket.length == 1)
        {
            var first = bucket[0];
            if (first.key.obj === key) return first.value;
            return null;
        }
        else
        {
            var found = null;
            bucket.forEach(function (e)
            {
                if (e.key.obj === key)
                {
                    found = e.value;
                    return false;
                }
            });
            return found;
        }
    }
    else
    {
        return null;
    }
}

Map.prototype.containsKey = function(key)
{
    this.get(key) !== null;
}

Map.prototype._genKey = function(obj, options, level)
{
    var self = this;

    options = options || {
        remLength: Map.MAXKEYLENGTH,
        remParts: 10
    };

    if (level === undefined) level = 0;

    var key = "";

    if (level > Map.MAXLEVEL || options.remLength <= 0 || options.remParts <= 0) return key;

    if (obj === null)
    {
        key = Map.NULL.substr(0, options.remLength);
    }
    else
    {
        var gmk = obj.getMapKey;
        if (_.isFunction(gmk))
        {
            key = gmk.call(obj).substr(0, options.remLength);
        }
        else
        {
            switch (typeof obj)
            {
                case "undefined":
                    key = Map.UNDEFINED.substr(0, options.remLength);
                    break;
                case "function":
                    key = obj.toString().substr(0, options.remLength);
                    break;
                default :
                    if (Array.isArray(obj))
                    {
                        obj.forEach(function (v)
                        {
                            key += self._genKey(v, options, level + 1);
                        });
                        if (!key && level == 0) key = Map.ARRAY.substr(0, options.remLength);
                    }
                    else
                    {
                        var ostr = obj.toString();
                        if (ostr != Map.OBJSTRING)
                        {
                            key = ostr.substr(0, options.remLength);
                        }
                        else
                        {
                            var any = false;
                            for (var n in obj)
                            {
                                if (obj.hasOwnProperty(n))
                                {
                                    var sub = self._genKey(obj[n], options, level + 1);
                                    key += (n + sub).substr(0, options.remLength);
                                    any = (sub ? true : false) || any;
                                }
                            }
                            if (!any && level == 0) key = (Map.OBJECT.substr(0, options.remLength) + key).substr(0, options.remLength);
                        }
                    }
                    break;
            }
        }
    }

    options.remParts--;
    options.remLength = Map.MAXKEYLENGTH - key.length;
    return key;
}

Map.Equatable = Equatable;

module.exports = Map;
