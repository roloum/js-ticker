//import package
const ticker = require("./src/ticker");
const args = require('minimist')(process.argv.slice(2))

console.log("args", args)
//instantiate object
const t = new ticker.Ticker(
    args['fetchInterval'] || 5,
);

function graceful () {
    console.log("\nSignal received. Terminating...");
    t.stop();
}

//start ticker
t.start();

process.on('SIGINT', graceful);
process.on('SIGTERM', graceful);