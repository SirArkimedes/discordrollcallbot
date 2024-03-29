const { EmbedBuilder } = require('discord.js');

const { readInFile, writeFile, MENTION_LIST_FILE_PATH } = require('./file_reader.js');
const { getHumanReadableMentionsList, rollCall, scheduleRollCall } = require('./rollcall.js');

function attemptCommandEvaluation(message) {
    var messageContent = message.content;
    if (messageContent.startsWith('!scheduledMentionAdd')) {
        addMemberToMentionList(message);
    } else if (messageContent.startsWith('!scheduledMentionRemove')) {
        removeMemberFromMentionList(message);
    } else if (messageContent.startsWith('!showMentionsList')) {
        showMentionsList(message);
    } else if (messageContent.startsWith('!setChannel')) {
        setChannel(message);
    } else if (messageContent.startsWith('!testRollCall')) {
        testRollCall(message);
    } else if (messageContent.startsWith('!skip')) {
        skip(message);
    } else if (messageContent.startsWith('!undoSkip')) {
        undoSkip(message);
    } else if (messageContent.startsWith('!ping')) {
        ping(message);
    }
};

function addMemberToMentionList(message) {
    readInFile(MENTION_LIST_FILE_PATH, (data) => {
        const userIds = message.mentions.users.map(user => {
            return user.id
        });

        var json = JSON.parse(data)
        var mentionsList = json.thoseToMention;
        for (let id of userIds) {
            if (!mentionsList.includes(id)) {
                mentionsList.push(id);
            }
        }

        json.thoseToMention = mentionsList;
        writeFile(MENTION_LIST_FILE_PATH, JSON.stringify(json, null, '\t'), (succeeded) => {
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

        var json = JSON.parse(data)
        var mentionsList = json.thoseToMention;
        for (let id of userIds) {
            if (mentionsList.includes(id)) {
                mentionsList = mentionsList.filter((value, index, array) => {
                    return value !== id;
                });
            }
        }

        json.thoseToMention = mentionsList;
        writeFile(MENTION_LIST_FILE_PATH, JSON.stringify(json, null, '\t'), (succeeded) => {
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
        const embedMessage = new EmbedBuilder()
            .setTitle('These suckers are in the list:')
            .setColor('0xccff33')
            .setDescription(getHumanReadableMentionsList(mentionsList));
        message.channel.send({ embeds: [embedMessage] });
    });
}

function setChannel(message) {
    readInFile(MENTION_LIST_FILE_PATH, data => {
        var settings = JSON.parse(data);
        settings.channelToSendTo = message.channel.id;
        
        writeFile(MENTION_LIST_FILE_PATH, JSON.stringify(settings, null, '\t'), succeeded => {
            if (succeeded) {
                message.react('✅');
            }
        });
    });
}

function testRollCall(message) {
    rollCall(message.client);
}

function skip(message) {
    readInFile(MENTION_LIST_FILE_PATH, data => {
        var settings = JSON.parse(data);

        const offsetTime = 604800000; // One week
        settings.timeToSendMessage += offsetTime;
        writeFile(MENTION_LIST_FILE_PATH, JSON.stringify(settings, null, '\t'), succeeded => {
            if (succeeded) {
                scheduleRollCall(message.client);
                message.channel.send('Skipping this week...');
            }
        });
    });
}

function undoSkip(message) {
    readInFile(MENTION_LIST_FILE_PATH, data => {
        var settings = JSON.parse(data);

        const offsetTime = 604800000; // One week
        settings.timeToSendMessage -= offsetTime;
        writeFile(MENTION_LIST_FILE_PATH, JSON.stringify(settings, null, '\t'), succeeded => {
            if (succeeded) {
                scheduleRollCall(message.client);
                message.channel.send('Undoing the previous skip...');
            }
        });
    });
}

function ping(message) {
    message.channel.send('PONG! but better than the other bots...');
}

exports.attemptCommandEvaluation = attemptCommandEvaluation;
