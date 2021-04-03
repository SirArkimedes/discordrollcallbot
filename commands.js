const { MessageEmbed } = require('discord.js');

const { readInFile, writeFile, MENTION_LIST_FILE_PATH } = require('./file_reader.js');
const { getHumanReadableMentionsList } = require('./ping.js');

function attemptCommandEvaluation(message) {
    var messageContent = message.content;
    if (messageContent.startsWith('!scheduledMentionAdd')) {
        addMemberToMentionList(message);
    } else if (messageContent.startsWith('!scheduledMentionRemove')) {
        removeMemberFromMentionList(message);
    } else if (messageContent.startsWith('!showMentionsList')) {
        showMentionsList(message);
    } else if (messageContent.startsWith('!ping')) {
        ping(message);
    }
};

function addMemberToMentionList(message) {
    readInFile(MENTION_LIST_FILE_PATH, (data) => {
        const userIds = message.mentions.users.map(user => {
            return user.id
        });

        var mentionsList = JSON.parse(data).thoseToMention;
        for (let id of userIds) {
            if (!mentionsList.includes(id)) {
                mentionsList.push(id);
            }
        }

        writeFile(MENTION_LIST_FILE_PATH, JSON.stringify(mentionsList), (succeeded) => {
            if (succeeded) {
                message.react('✅');
                showMentionsList(message);
            }
        });
    });
};

function removeMemberFromMentionList(message) {
    readInFile(MENTION_LIST_FILE_PATH, (data) => {
        const userIds = message.mentions.users.map(user => {
            return user.id
        });

        var mentionsList = JSON.parse(data).thoseToMention;
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
                showMentionsList(message);
            }
        });
    });
};

function showMentionsList(message) {
    readInFile(MENTION_LIST_FILE_PATH, (data) => {
        var mentionsList = JSON.parse(data).thoseToMention;
        const embedMessage = new MessageEmbed()
            .setTitle('These suckers are in the list:')
            .setColor('0xffe000')
            .setDescription(getHumanReadableMentionsList(mentionsList));
        message.channel.send(embedMessage);
    });
}

function ping(message) {
    message.channel.send('PONG! but better than the other bots...');
}

exports.attemptCommandEvaluation = attemptCommandEvaluation;