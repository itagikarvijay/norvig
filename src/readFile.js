const fetch = require('node-fetch');

let readFile = async function () {
    console.log('Fetching data...');
    return await new Promise(function (resolve, reject) {
        const options = {
            method: 'get',
            headers: {
                'Content-type': 'text/plain; charset=UTF-8'
            }
        }
        fetch('http://norvig.com/big.txt', options)
            .then(response => {
                return response.text();
            }).then(responseText => {
                process(responseText).then(formatedDATA => {
                    findTopTen(formatedDATA).then((max) => {
                        callToDictionaryAPI(max)
                            .then(finalResponse => {
                                resolve(finalResponse);
                            })
                    });
                });
            }).catch(err => {
                console.error('Request failed', err)
            })
    });
};
/*
    Process the file for words.!
*/
async function process(response) {
    console.log('processing...');
    return await new Promise(function (resolve, reject) {
        let map = new Map();
        let space = ' ';
        let countRow = 0;
        let rows = response.split("\n");
        for (let row of rows) {
            let words = row.split(space);
            for (let word of words) {
                word = word.toLowerCase().trim();
                word = replaceAll(word, ".", "");
                word = replaceAll(word, ",", "");
                word = replaceAll(word, "!", "");
                word = replaceAll(word, "?", "");
                word = replaceAll(word, "*", "");
                word = replaceAll(word, ":", "");
                word = replaceAll(word, ";", "");
                word = replaceAll(word, "'", "");
                if (word.length >= 4) {
                    if (typeof map.get(word) === 'undefined') {
                        map.set(word, 1);
                    } else {
                        let count = parseInt(map.get(word)) + 1;
                        map.set(word, count);
                    }
                }
            }
            countRow++;
        }
        if (rows.length === countRow) {
            resolve(map);
        } else {
            reject('Rejected ' + countRow);
        }
    });
}
/*
    Find the top ten words.!
*/
async function findTopTen(formatedDATA) {
    console.log('Finding top ten...');
    return await new Promise(function (resolve, reject) {
        let count = 0;
        let word = ''
        let topTen = [];
        for (let i = 0; i < 10; i++) {
            formatedDATA.forEach((value, key) => {
                if (value > count) {
                    count = value;
                    word = key;
                    formatedDATA.set(word, 0)
                }
            });
            topTen.push({ word: word, max: count });
            count = 0;
        }
        resolve(topTen);
    });
}
/*
    Find the syn for top ten words.!
*/
async function callToDictionaryAPI(obj) {
    console.log('Calling dictionaryAPI...');
    return new Promise((resolve, reject) => {
        let arrX = [];
        obj.forEach(async (value, index) => {
            let url = 'https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=dict.1.1.20170610T055246Z.0f11bdc42e7b693a.eefbde961e10106a4efa7d852287caa49ecc68cf&lang=en-fr&text=' + value.word + ''
            let promise = await fetch(url, {
                keepalive: true,
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
            });
            await promise.json().then(response => {
                if (response.def.length > 0) {
                    arrX.push(defMain(response.def, {}, value.max));
                } else {
                    arrX.push(value.word.toUpperCase()+' syn not found.!');
                }
                if (arrX.length === obj.length) {
                    resolve(arrX)
                }
            })
        });
    });
}

function defMain(def, outPut, count) {
    outPut.word = def[0].text;
    outPut.count = count;
    outPut.syn = [];
    def.forEach((defArray, index) => {
        if (typeof defArray.tr !== 'undefined' && defArray.tr.length > 0) {
            outPut = tr(defArray.tr, outPut);
        }
    });
    return outPut
}

function tr(tr, outPut) {
    tr.forEach((trArray, index) => {
        if (typeof trArray.syn !== 'undefined' && trArray.syn.length > 0) {
            syn(trArray.syn).forEach((value, index) => {
                outPut.syn.push(value);
            })
        }
    })
    return outPut;
}

function syn(syn) {
    let arr = [];
    syn.forEach((synArray, index) => {
        arr.push({ "text": synArray.text, "pos": synArray.pos });
    });
    return arr;
}

function escapeRegExp(string) {
    return string.replace(/[.':;!*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceAll(str, term, replacement) {
    return str.replace(new RegExp(escapeRegExp(term), 'g'), replacement).replace('"', "");
}

module.exports = {
    readFile
}