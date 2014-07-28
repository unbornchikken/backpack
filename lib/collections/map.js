var V8Map = global.Map ? global.Map : null; // At Node.js 0.11.13 there is no iterators for maps
var ES6Map = V8Map && V8Map.forEach ? V8Map : null;

var _ = require("lodash");

/*Equatable*/

function Equatable(obj)
{
    this._obj = obj;
    if (!_.isFunction(this._obj_equals = (obj["equals"] || obj["_equals"]))) this._obj_equals = false;
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
    return this._obj === other;
}

/* Map */

function Map(options)
{
    var opts = _.extend(
        {
            forceES6Map: false
        },
        options);

    this._list = null;
    if (ES6Map )
    {
        this._es6Map = new ES6Map();
    }
    else if (V8Map && opts.forceES6Map)
    {
        this._es6Map = new V8Map();
    }
    else
    {
        this._es6Map = null;
        this._list = [];
        this._buckets = null;
        this._count = 0;
    }
}

Map.OBJSTRING = "[object Object]";
Map.NULL = "#$@%TRQg";
Map.UNDEFINED = "#$@%TRQa";
Map.ARRAY = "#$@%TRQw";
Map.OBJECT = "#$@%TRQe";
Map.MAXKEYLENGTH = 256;
Map.MAXLEVEL = 2;
Map.MAXPARTS = 10;
Map.PROMOTEAT = 16;

Object.defineProperties(
    Map.prototype, {
        count: {
            get: function ()
            {
                return this._es6Map ? this._es6Map.size : this._count;
            }
        }
    });

Map.prototype._promoteIfNeeded = function ()
{
    var self = this;
    if (self._list && self._count >= Map.PROMOTEAT)
    {
        var list = self._list;
        self._list = null;
        self._count = 0;
        self._buckets = {};
        list.forEach(function (item)
        {
            self.add(item.key.obj, item.value);
        });
    }
}

Map.prototype._serializeToJSON = function()
{
    var data = [];
    this.forEach(function(kvp)
    {
        data.push(kvp);
    });
    return { items: data };
}

Map.prototype._deserializeFromJSON = function (json)
{
    if (this._es6Map)
    {
        this._es6Map.clear();
    }
    else
    {
        this._list = [];
        this._buckets = null;
        this._count = 0;
    }

    if (!_.isObject(json) || _.isArray(json)) throw new TypeError("Object argument expected.");
    if (!_.isArray(json.items)) throw new TypeError("Argument property 'items' value is not an array.");
    var self = this;
    json.items.forEach(function(kvp)
    {
        self.add(kvp.key, kvp.value);
    });
}

Map.prototype.add = function (key, value)
{
    this.set(key, value, true);
}

Map.prototype.set = function (key, value, throwIfExists)
{
    if (this._es6Map)
    {
        if (throwIfExists && this._es6Map.has(key)) throw new Error("Item by key '" + key + "' already exists.");
        this._es6Map.set(key, value);
    }
    else
    {
        this._promoteIfNeeded();
        if (this._list)
        {
            this._setLvl1(key, value, throwIfExists);
        }
        else
        {
            this._setLvl2(Map._genKey(key), key, value, throwIfExists);
        }
    }
}

Map.prototype._setLvl1 = function (key, value, throwIfExists)
{
    if (value === undefined) throw new TypeError("Argument 'value' expected.");

    var found = -1;
    this._list.forEach(function (item, idx)
    {
        if (item.key.equals(key))
        {
            found = idx;
            return false;
        }
    });
    if (found == -1)
    {
        this._list.push({key: new Equatable(key), value: value });
        this._count++;
    }
    else
    {
        if (throwIfExists) throw new Error("Item by key '" + key + "' already exists.");
        this._list.splice(found, 1, {key: new Equatable(key), value: value });
    }
}

Map.prototype._setLvl2 = function (bucketKey, originalKey, value, throwIfExists)
{
    if (value === undefined) throw new TypeError("Argument 'value' expected.");

    var bucket = this._buckets[bucketKey];
    if (!bucket)
    {
        bucket = [
            {
                key: new Equatable(originalKey),
                value: value
            }
        ];
        this._buckets[bucketKey] = bucket;
        this._count++;
    }
    else
    {
        var found = undefined;

        bucket.forEach(
            function (e)
            {
                if (e.key.equals(originalKey))
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
                    key: new Equatable(originalKey),
                    value: value
                });
            this._count++;
        }
    }
}

Map.prototype.get = function (key)
{
    if (this._es6Map)
    {
        return this._es6Map.get(key);
    }
    else
    {
        if (this._list)
        {
            return this._getLvl1(key);
        }
        else
        {
            return this._getLvl2(Map._genKey(key), key);
        }
    }
}

Map.prototype._getLvl1 = function (key)
{
    var found;
    this._list.forEach(function (item, idx)
    {
        if (item.key.equals(key))
        {
            found = item.value;
            return false;
        }
    });
    return found;
}

Map.prototype._getLvl2 = function (bucketKey, originalKey)
{
    var bucket = this._buckets[bucketKey];
    if (bucket)
    {
        if (bucket.length == 1)
        {
            var first = bucket[0];
            if (first.key.equals(originalKey)) return first.value;
        }
        else
        {
            var found;
            bucket.forEach(
                function (e)
                {
                    if (e.key.equals(originalKey))
                    {
                        found = e.value;
                        return false;
                    }
                });
            return found;
        }
    }
}

Map.prototype.remove = function (key)
{
    if (this._es6Map)
    {
        return this._es6Map.delete(key);
    }
    else
    {
        if (this._list)
        {
            return this._removeLvl1(key);
        }
        else
        {
            return this._removeLvl2(Map._genKey(key), key);
        }
    }
}

Map.prototype._removeLvl1 = function (key)
{
    var found = -1;
    this._list.forEach(function (item, idx)
    {
        if (item.key.equals(key))
        {
            found = idx;
            return false;
        }
    });
    if (found != -1)
    {
        this._list.splice(found, 1);
        this._count--;
        return true;
    }
    return false;
}

Map.prototype._removeLvl2 = function (bucketKey, originalKey)
{
    var bucket = this._buckets[bucketKey];
    if (bucket)
    {
        if (bucket.length == 1)
        {
            var first = bucket[0];
            if (first.key.equals(originalKey))
            {
                bucket.length = 0;
                this._count--;
                return true;
            }
        }
        else
        {
            var found = -1;
            bucket.forEach(
                function (e, i)
                {
                    if (e.key.equals(originalKey))
                    {
                        found = i;
                        return false;
                    }
                });
            if (found !== -1)
            {
                bucket.splice(found, 1);
                this._count--;
                return true;
            }
        }
    }
    return false;
}

Map.prototype.containsKey = function (key)
{
    if (this._es6Map)
    {
        return this._es6Map.has(key);
    }
    else
    {
        return this.get(key) !== undefined;
    }
}

Map.prototype.clear = function ()
{
    if (this._es6Map)
    {
        this._es6Map.clear();
    }
    else
    {
        if (this._count !== 0)
        {
            if (this._list)
            {
                this._list.length = 0;
            }
            else
            {
                this._buckets = {};
            }
            this._count = 0;
        }
    }
}

Map.prototype.forEach = function (f)
{
    var self = this;

    if (this._es6Map)
    {
        if (ES6Map)
        {
            this._es6Map.forEach(function (key, value)
            {
                f({key: key, value: value });
            });
        }
        else
        {
            throw new Error("Iterating is not yet supported on v8.");
        }
    }
    else
    {
        if (self._list)
        {
            self._list.forEach(function (item)
            {
                f({ key: item.key.obj, value: item.value});
            })
        }
        else
        {
            for (var bn in self._buckets)
            {
                if (self._buckets.hasOwnProperty(bn))
                {
                    self._buckets.forEach(function (item)
                    {
                        f({ key: item.key.obj, value: item.value});
                    })
                }
            }
        }
    }
}

Map.prototype.forEachKey = function (f)
{
    var self = this;

    if (this._es6Map)
    {
        if (ES6Map)
        {
            this._es6Map.forEach(function(key, value)
            {
                f(key);
            });
        }
        else
        {
            throw new Error("Iterating is not yet supported on v8.");
        }
    }
    else
    {
        if (self._list)
        {
            self._list.forEach(function (item)
            {
                f(item.key.obj);
            })
        }
        else
        {
            for (var bn in self._buckets)
            {
                if (self._buckets.hasOwnProperty(bn))
                {
                    self._buckets.forEach(function (item)
                    {
                        f(item.key.obj);
                    })
                }
            }
        }
    }
}

Map.prototype.forEachValue = function (f)
{
    var self = this;

    if (this._es6Map)
    {
        if (ES6Map)
        {
            this._es6Map.forEach(function(key, value)
            {
                f(value);
            });
        }
        else
        {
            throw new Error("Iterating is not yet supported on v8.");
        }
    }
    else
    {
        if (self._list)
        {
            self._list.forEach(function (item)
            {
                f(item.value);
            })
        }
        else
        {
            for (var bn in self._buckets)
            {
                if (self._buckets.hasOwnProperty(bn))
                {
                    self._buckets.forEach(function (item)
                    {
                        f(item.value);
                    })
                }
            }
        }
    }
}

Map._genKey = function (obj, level, parts, len)
{
    var self = this;

    var key = "";

    if (level === undefined)
    {
        level = 0;
        parts = { value: 0 };
        len = { value: 0 };
    }
    if (level > Map.MAXLEVEL) return key;
    if (parts.value > Map.MAXPARTS) return key;
    if (len.value > Map.MAXKEYLENGTH) return key;

    if (obj === null)
    {
        key = Map.NULL;
    }
    else
    {
        switch (typeof obj)
        {
            case "string":
                key = obj;
                break;
            case "undefined":
                key = Map.UNDEFINED;
                break;
            case "function":
                key = obj.toString();
                break;
            default :
                var kf = obj["getMapKey"] || obj["_getMapKey"];
                if (_.isFunction(kf))
                {
                    key = kf.call(obj);
                    if (key === undefined) key = Map.UNDEFINED;
                    else if (!_.isString(key)) key = key !== null ? key.toString() : Map.NULL;
                }
                else if (Array.isArray(obj))
                {
                    var c = 0;
                    obj.forEach(
                        function (v)
                        {
                            parts.value++;
                            if (parts.value > Map.MAXPARTS) return false;
                            if (len.value > Map.MAXKEYLENGTH) return false;
                            key += Map._genKey(v, level + 1, parts, len);
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
                        if (key === undefined) key = Map.UNDEFINED;
                        else if (!_.isString(key)) key = key !== null ? key.toString() : Map.NULL;
                    }
                    else
                    {
                        var c = 0;
                        if (level === 0 && obj.constructor.name !== "Object")
                        {
                            var pn = obj.constructor.name.substr(0, 8);
                            key += pn;
                            len.value += pn.length;
                            c++;
                        }
                        for (var n in obj)
                        {
                            if (obj.hasOwnProperty(n))
                            {
                                parts.value++;
                                if (parts.value > Map.MAXPARTS) break;
                                if (len.value > Map.MAXKEYLENGTH) break;
                                var sub = Map._genKey(obj[n], level + 1, parts, len);
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

    key = key.substr(0, Map.MAXKEYLENGTH);
    len.value += key.length;
    return key;
}

Map.Equatable = Equatable;

module.exports = Map;
