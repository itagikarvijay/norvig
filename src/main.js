var readObj = require('./readFile.js');

function main() {
    readObj.readFile().then(data => {
        console.log("*****************Top ten word with Syn.!*****************");
        console.log();
        var dataJSON = JSON.stringify(data);
        console.dir(dataJSON)

    });
}

function printAllVals(obj) {
    for (let k in obj) {
        if (typeof obj[k] === "object") {
            printAllVals(obj[k])
        } else {
            // base case, stop recurring
            console.log(obj[k]);
        }
    }
}
main();