const { MessageEmbed } = require('discord.js');

const { MENTION_LIST_FILE_PATH, readInFile, writeFile } = require('./file_reader.js');

var thoseThatAreIn = [];
var thoseThatAreOut = [];

var savedMessage = null;

// Public

function scheduleRollCall(client) {
    readInFile(MENTION_LIST_FILE_PATH, data => {
        const settings = JSON.parse(data);
        const differenceNowToScheduledTime = settings.timeToSendMessage - Date.now();
        setTimeout(() => {
            rollCall(client, true);
        }, differenceNowToScheduledTime);
    });
}

function rollCall(client, isFromScheduler = false) {
    readInFile(MENTION_LIST_FILE_PATH, data => {
        const settings = JSON.parse(data);
        var channel = null;

        for (const [guildKey, guild] of client.guilds.cache) {
            for (const [channelKey, cachedChannel] of guild.channels.cache) {
                if (channelKey == settings.channelToSendTo) {
                    channel = cachedChannel;
                }
            }
        }

        if (channel === null) {
            console.log('Cannot find channel described in settings!');
        } else {
            if (isFromScheduler) {
                const offsetTime = 60 * 1000;
                settings.timeToSendMessage += offsetTime;
                writeFile(MENTION_LIST_FILE_PATH, JSON.stringify(settings, null, '\t'), succeeded => {
                    if (succeeded) {
                        scheduleRollCall(client);
                    }
                });
            }

            thoseThatAreIn = [];
            thoseThatAreOut = [];
            const mentionsList = settings.thoseToMention;
            const messageToSend = new MessageEmbed()
                .setTitle('Who\'s in?')
                .setColor('0xffe000')
                .setDescription(getDescription());
            const messageContent = `ROLL CALL!\n\n${getHumanReadableMentionsList(mentionsList)} are you in?`;

            channel.send({ content: messageContent, embed: messageToSend })
                .then(embededMessage => {
                    handleMessageReactions(embededMessage);
                });
        }
    })
};

function getHumanReadableMentionsList(mentionsList) {
    var thoseToMention = '';
    for (i = 0; i < mentionsList.length; i++) {
        if (mentionsList.length != 1 && i == mentionsList.length - 1) {
            thoseToMention += ' and '
        }

        thoseToMention += `<@${mentionsList[i]}>`

        if (mentionsList.length != 1 && i != mentionsList.length - 1 && mentionsList.length != 2) {
            thoseToMention += ', '
        }
    }
    return thoseToMention;
}

// Helpers

function getDescription() {
    var description = 'React to this message to mark that you\'re in or out for tonight!';
    if (thoseThatAreIn.length > 0) {
        description += `\n\nThose in: 🙋\n${getHumanReadableMentionsList(thoseThatAreIn)}`
    }
    if (thoseThatAreOut.length > 0) {
        description += `\n\nThose out: 😢\n${getHumanReadableMentionsList(thoseThatAreOut)}`
    }
    return description;
}

function handleMessageReactions(embededMessage) {
    savedMessage = embededMessage;

    savedMessage.react('👍');
    savedMessage.react('👎');

    const filter = (reaction, user) => {
        return ['👍', '👎'].includes(reaction.emoji.name) && user.id !== savedMessage.author.id;
    };
    savedMessage.createReactionCollector(filter, { time: 86400000, dispose: true }) // One day in milliseconds
        .on('collect', (reaction, user) => {
            if (reaction.emoji.name === '👍') {
                savedMessage.channel.send(`🙋 <@${user.id}> is in!`);
                thoseThatAreIn.push(user.id);
            } else if (reaction.emoji.name === '👎') {
                savedMessage.channel.send(`😢 <@${user.id}> is out!`);
                thoseThatAreOut.push(user.id);
            }

            const editedEmbed = new MessageEmbed(savedMessage.embeds[0]);
            editedEmbed.description = getDescription();
            savedMessage.edit(editedEmbed).then(editedMessage => {
                savedMessage = editedMessage
            });
        })
        .on('remove', (reaction, user) => {
            savedMessage.channel.send(`<@${user.id}> removed their choice!`);

            if (reaction.emoji.name === '👍') {
                thoseThatAreIn = thoseThatAreIn.filter((value, index, array) => {
                    return value !== user.id;
                });
            } else if (reaction.emoji.name === '👎') {
                thoseThatAreOut = thoseThatAreOut.filter((value, index, array) => {
                    return value !== user.id;
                });
            }

            const editedEmbed = new MessageEmbed(savedMessage.embeds[0]);
            editedEmbed.description = getDescription();
            savedMessage.edit(editedEmbed).then(editedMessage => {
                savedMessage = editedMessage
            });
        })
        .on('end', collected => console.log(`Collected ${collected.size} items`));
}

exports.scheduleRollCall = scheduleRollCall;
exports.rollCall = rollCall;
exports.getHumanReadableMentionsList = getHumanReadableMentionsList;