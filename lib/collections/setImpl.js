function SetImpl(map)
{
    this._map = map;
}

Object.defineProperties(
    SetImpl.prototype, {
        count: {
            get: function ()
            {
                return this._map.count;
            }
        }
    });

SetImpl.prototype.add = function (value)
{
    var pc = this._map.count;
    this._map.set(value, true);
    return pc != this._map.count;
}

SetImpl.prototype.remove = function (value)
{
    return this._map.remove(value);
}

SetImpl.prototype.clear = function ()
{
    this._map.clear();
}

SetImpl.prototype.exists = function (value)
{
    return this._map.containsKey(value);
}

SetImpl.prototype.forEach = function (f)
{
    this._map.forEachKey(f);
}

module.exports = SetImpl;
