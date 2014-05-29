var _ = require("underscore-node");

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

StrMap.prototype.add = function (key, value)
{
    StrMap._verifyKey(key);
    this.set(key, value, true);
}

StrMap.prototype.set = function (key, value, throwIfExists)
{
    StrMap._verifyKey(key);
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
    this._map = {};
    this._count = 0;
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
