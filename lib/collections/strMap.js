var _ = require("lodash");

function StrMap()
{
    this._count = 0;
    this._map = {};
}

Object.defineProperties(
    StrMap.prototype, {
        count: {
            get: function ()
            {
                return this._count;
            }
        }
    });

StrMap.prototype._serializeToJSON = function()
{
    var data = [];
    this.forEach(function(kvp)
    {
        data.push(kvp);
    });
    return { items: data };
}

StrMap.prototype._deserializeFromJSON = function (json)
{
    this._count = 0;
    this._map = {};

    if (!_.isObject(json) || _.isArray(json)) throw new TypeError("Object argument expected.");
    if (!_.isArray(json.items)) throw new TypeError("Argument property 'items' value is not an array.");
    var self = this;
    json.items.forEach(function(kvp)
    {
        self.add(kvp.key, kvp.value);
    });
}

StrMap.prototype.add = function (key, value)
{
    StrMap._verifyKey(key);
    this._set(key, value, true);
}

StrMap.prototype.set = function (key, value, throwIfExists)
{
    StrMap._verifyKey(key);
    this._set(key, value, throwIfExists);
}

StrMap.prototype._set = function (key, value, throwIfExists)
{
    if (this._map[key] !== undefined)
    {
        if (throwIfExists) throw new Error("Item by key already exists.");
    }
    else
    {
        this._count++;
    }

    this._map[key] = value;
}

StrMap.prototype.get = function (key)
{
    StrMap._verifyKey(key);
    return this._map[key];
}

StrMap.prototype.remove = function (key)
{
    StrMap._verifyKey(key);

    var result = false;
    if (this._map[key] !== undefined)
    {
        this._count--;
        result = true;
    }
    delete this._map[key];
    return result;
}

StrMap.prototype.containsKey = function (key)
{
    StrMap._verifyKey(key);
    return this._map[key] !== undefined;
}

StrMap.prototype.clear = function ()
{
    if (this._count !== 0)
    {
        this._map = {};
        this._count = 0;
    }
}

StrMap.prototype.forEach = function (f)
{
    for (var n in this._map)
    {
        if (this._map.hasOwnProperty(n))
        {
            f({ key: n, value: this._map[n]});
        }
    }
}

StrMap.prototype.forEachKey = function (f)
{
    for (var n in this._map)
    {
        if (this._map.hasOwnProperty(n))
        {
            f(n);
        }
    }
}

StrMap.prototype.forEachValue = function (f)
{
    for (var n in this._map)
    {
        if (this._map.hasOwnProperty(n))
        {
            f(this._map[n]);
        }
    }
}

StrMap._verifyKey = function (key)
{
    if (!_.isString(key)) throw new TypeError("Argument 'key' must be a string.");
}

module.exports = StrMap;
