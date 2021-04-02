const { readInFile, writeFile, MENTION_LIST_FILE_PATH } = require('./file_reader.js');

function attemptCommandEvaluation(message) {
    var messageContent = message.content;
    if (messageContent.startsWith('!scheduledMentionAdd')) {
        addMemberToMentionList(message);
    } else if (messageContent.startsWith('!scheduledMentionRemove')) {
        removeMemberFromMentionList(message);
    }
};

function addMemberToMentionList(message) {
    readInFile(MENTION_LIST_FILE_PATH, (data) => {
        const userIds = message.mentions.users.map(user => {
            return user.id
        });
        
        var mentionsList = JSON.parse(data);
        for (let id of userIds) {
            if (!mentionsList.includes(id)) {
                mentionsList.push(id);
            }
        }
        
        writeFile(MENTION_LIST_FILE_PATH, JSON.stringify(mentionsList), (succeeded) => {
            if (succeeded) {
                message.react('✅');
            }
        });
    });
};

function removeMemberFromMentionList(message) {
    readInFile(MENTION_LIST_FILE_PATH, (data) => {
        const userIds = message.mentions.users.map(user => {
            return user.id
        });
        
        var mentionsList = JSON.parse(data);
        for (let id of userIds) {
            if (mentionsList.includes(id)) {
                mentionsList = mentionsList.filter((value, index, array) => {
                    return value !== id;
                });
            }
        }
        
        writeFile(MENTION_LIST_FILE_PATH, JSON.stringify(mentionsList), (succeeded) => {
            if (succeeded) {
                message.react('✅');
            }
        });
    });
};

exports.attemptCommandEvaluation = attemptCommandEvaluation;