/* jshint -W061 */

var es6 = true;
try {
    eval("(function *(){})");
} catch (err) {
    es6 = false;
}

if (!es6) {
    require("traceur-runtime");
}

require(es6 ? "./es6" : "./es5");