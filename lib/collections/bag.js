var BagImpl = require("./bagImpl");
var Map = require("./map");
var util = require("util");

function Bag()
{
    BagImpl.call(this, new Map());
}

util.inherits(Bag, BagImpl);

module.exports = Bag;
