/* jshint -W061 */

var es6 = true;
try {
    eval("(function *(){})");
} catch (err) {
    es6 = false;
}

var es = es6 ? "es6" : "es5";

if (!es6) {
    require("traceur-runtime");
}

module.exports = {
    system: require("./lib/" + es + "/system"),
    collections: require("./lib/" + es + "/collections")
};