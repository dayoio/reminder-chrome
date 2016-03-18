const tasks = require('./tasks');

tasks.copyAssets('dev');
exec('webpack-dev-server --config=dev.config.js --no-info --hot --inline --colors');
