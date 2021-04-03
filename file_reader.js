const fs = require('fs');

const MENTION_LIST_FILE_PATH = './settings.json'

function readInFile(filePath, callback) {
    fs.readFile(filePath, 'utf8', (error, data) => {
        if (error) {
            console.log(`Error reading file from disk: ${error}`);
        } else {
            callback(data);
        }
    });
};

function writeFile(filePath, data, callback) {
    fs.writeFile(filePath, data, 'utf8', (error) => {
        if (error) {
            console.log(`Error writing file: ${error}`);
        } else {
            callback(true);
        }
    });
};

exports.MENTION_LIST_FILE_PATH = MENTION_LIST_FILE_PATH;
exports.readInFile = readInFile;
exports.writeFile = writeFile;