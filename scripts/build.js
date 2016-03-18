const tasks = require('./tasks');

tasks.copyAssets('build');
exec('webpack --config prod.config.js --progress --profile --colors');
