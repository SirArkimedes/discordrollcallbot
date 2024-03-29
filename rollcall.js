const { EmbedBuilder } = require('discord.js');

const { MENTION_LIST_FILE_PATH, readInFile, writeFile } = require('./file_reader.js');

var mentionsList = [];
var thoseThatAreIn = [];
var thoseThatAreOut = [];

var savedMessage = null;
var timeoutId = null;

// Public

function scheduleRollCall(client) {
    readInFile(MENTION_LIST_FILE_PATH, data => {
        if (timeoutId != null) {
            clearTimeout(timeoutId);
        }

        const settings = JSON.parse(data);
        const differenceNowToScheduledTime = settings.timeToSendMessage - Date.now();
        timeoutId = setTimeout(() => {
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
                const offsetTime = 604800000; // One week
                settings.timeToSendMessage += offsetTime;
                writeFile(MENTION_LIST_FILE_PATH, JSON.stringify(settings, null, '\t'), succeeded => {
                    if (succeeded) {
                        scheduleRollCall(client);
                    }
                });
            }

            thoseThatAreIn = [];
            thoseThatAreOut = [];
            mentionsList = settings.thoseToMention;
            const messageToSend = new EmbedBuilder()
                .setTitle('📝 Who\'s going to be joining us tonight?')
                .setColor('0xccff33')
                .setDescription(getDescription());
            const messageContent = `${getHumanReadableMentionsList(mentionsList)} are you in?`;

            channel.send({ content: messageContent, embeds: [messageToSend] })
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
            thoseToMention += 'and '
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

    var thoseThatHaveNotResponded = [];
    for (id of mentionsList) {
        if (!thoseThatAreIn.includes(id) && !thoseThatAreOut.includes(id)) {
            thoseThatHaveNotResponded.push(id);
        }
    }
    if (thoseThatHaveNotResponded.length > 0) {
        description += `\n\nThose that have not responded: \n${getHumanReadableMentionsList(thoseThatHaveNotResponded)}`
    }

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

    const collector = savedMessage.createReactionCollector({ filter, time: 86400000, dispose: true }) // One day in milliseconds
    collector.on('collect', (reaction, user) => {
        console.log(`${user.tag} reacted with "${reaction.emoji.name}".`);

        if (reaction.emoji.name === '👍') {
            savedMessage.channel.send(`🙋 <@${user.id}> is in!`);
            thoseThatAreIn.push(user.id);
        } else if (reaction.emoji.name === '👎') {
            savedMessage.channel.send(`😢 <@${user.id}> is out!`);
            thoseThatAreOut.push(user.id);
        }

        const editedEmbed = EmbedBuilder.from(savedMessage.embeds[0]);
        editedEmbed.setDescription(getDescription());
        
        reaction.message.edit({ embeds: [editedEmbed] }).then(editedMessage => {
            savedMessage = editedMessage
        });
    })
    collector.on('remove', (reaction, user) => {
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

        const editedEmbed = EmbedBuilder.from(savedMessage.embeds[0]);
        editedEmbed.setDescription(getDescription());

        reaction.message.edit({ embeds: [editedEmbed] }).then(editedMessage => {
            savedMessage = editedMessage
        });
    })
    collector.on('end', collected => {
        console.log(`Collected ${collected.size} items`)
    });
}

exports.scheduleRollCall = scheduleRollCall;
exports.rollCall = rollCall;
exports.getHumanReadableMentionsList = getHumanReadableMentionsList;