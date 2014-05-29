var _ = require("underscore-node");

function BagImpl(map)
{
    this._map = map;
}

Object.defineProperties(
    BagImpl.prototype, {
        bagsCount: {
            get: function ()
            {
                return this._map.count;
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
    this._map.set(key, coll);
}

BagImpl.prototype.get = function(key)
{
    return this._map.get(key);
}

BagImpl.prototype.remove = function(key)
{
    return this._map.remove(key);
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

BagImpl.prototype.forEachBag = function (f)
{
    var self = this;
    this._map.forEachValue(f);
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