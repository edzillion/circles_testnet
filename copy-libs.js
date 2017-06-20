var fs = require('fs-extra')

var dependencies = [
    ['plugins/cordova-plugin-fcm/www/FCMPlugin.js','www/libs/FCMPlugin.js']
];

dependencies.forEach(function(value) {
    fs.copy(value[0],value[1]);
});
