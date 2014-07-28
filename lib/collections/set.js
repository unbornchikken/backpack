var SetImpl = require("./setImpl");
var Map = require("./map");
var util = require("util");

function Set(options)
{
    SetImpl.call(this, new Map(options));
}

util.inherits(Set, SetImpl);

module.exports = Set;