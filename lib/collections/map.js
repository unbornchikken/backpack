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
Map.MAXPARTS = 7;

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

    var bKey = Map._genKey(key);

    var bucket = this._buckets[bKey];
    if (!bucket)
    {
        bucket = [
            {
                key: new Equatable(key),
                value: value
            }
        ];
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
            bucket.push(
                {
                    key: new Equatable(key),
                    value: value
                });
        }
    }
}

Map.prototype.get = function (key)
{
    var bKey = Map._genKey(key);
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
            bucket.forEach(
                function (e)
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

Map.prototype.containsKey = function (key)
{
    this.get(key) !== null;
}

Map._genKey = function (obj, level, parts)
{
    var self = this;

    var key = "";

    if (level === undefined) level = 0;
    if (parts === undefined) parts = { value: 0 };
    if (level > Map.MAXLEVEL) return key;
    if (parts.value > Map.MAXPARTS) return key;
    
    if (obj === null)
    {
        key = Map.NULL;
    }
    else
    {
        switch (typeof obj)
        {
            case "undefined":
                key = Map.UNDEFINED;
                break;
            case "function":
                key = obj.toString();
                break;
            default :
                if (Array.isArray(obj))
                {
                    var c = 0;
                    obj.forEach(
                        function (v)
                        {
                            parts.value++;
                            if (parts.value > Map.MAXPARTS) return false;
                            key += Map._genKey(v, level + 1, parts);
                            c++;
                        });
                    if (!c && level === 0) key = Map.ARRAY;
                }
                else
                {
                    var ostr = obj.toString();
                    if (ostr != Map.OBJSTRING)
                    {
                        key = ostr;
                    }
                    else
                    {
                        var c = 0;
                        for (var n in obj)
                        {
                            if (obj.hasOwnProperty(n))
                            {
                                parts.value++;
                                if (parts.value > Map.MAXPARTS) break;
                                var sub = Map._genKey(obj[n], level + 1, parts);
                                key += (n.substr(0, 8) + sub);
                                c++;
                            }
                        }
                        if (!c && level === 0) key = Map.OBJECT;
                    }
                }
                break;
        }
    }

    return key;
}

Map.Equatable = Equatable;

module.exports = Map;
