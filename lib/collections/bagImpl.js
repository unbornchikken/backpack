var _ = require("lodash");

function BagImpl(map)
{
    this._map = map;
}

Object.defineProperties(
    BagImpl.prototype, {
        collectionsCount: {
            get: function ()
            {
                return this._map.count;
            }
        },
        count: {
            get: function ()
            {
                var c = 0;
                this._map.forEachValue(function()
                {
                    c++;
                });
                return c;
            }
        }
    });

BagImpl.prototype.add = function (key, value)
{
    var coll = this._map.get(key);
    if (coll === undefined)
    {
        coll = [ value ];
        this._map.add(key, coll);
        return 1;
    }
    else
    {
        coll.push(value);
        return coll.length;
    }
}

BagImpl.prototype.set = function (key, coll)
{
    if (!_.isArray(coll)) throw new TypeError("Argument 'coll' must be an array.");
    if (coll.length === 0)
    {
        this._map.remove(key);
    }
    else
    {
        this._map.set(key, coll);
    }
}

BagImpl.prototype.remove = function(key, value)
{
    if (value === undefined)
    {
        return this._map.remove(key);
    }
    else
    {
        var coll = this._map.get(key);
        if (coll !== undefined)
        {
            var idx = coll.indexOf(value);
            if (idx !== -1)
            {
                coll.splice(idx, 1);
                if (coll.length === 0)
                {
                    this.remove(key);
                }
                return true;
            }
        }
    }
    return false;
}

BagImpl.prototype.clear = function()
{
    this._map.clear();
}

BagImpl.prototype.forEach = function (f)
{
    var self = this;
    this._map.forEach(function(item)
    {
        item.value.forEach(function(value)
        {
            f({key: item.key, value: value });
        })
    })
}

BagImpl.prototype.forEachValueIn = function (key, f)
{
    var coll = this._map.get(key);
    if (coll) coll.forEach(f);
}

BagImpl.prototype.forEachKey = function (f)
{
    var self = this;
    this._map.forEachKey(f);
}

BagImpl.prototype.forEachValue = function (f)
{
    var self = this;
    this._map.forEach(function(item)
    {
        item.value.forEach(function(value)
        {
            f(value);
        })
    })
}

module.exports = BagImpl;