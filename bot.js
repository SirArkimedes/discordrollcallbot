const { Client, MessageEmbed } = require('discord.js');
const auth = require('./auth.json');
const commands = require('./commands.js');
const { readInFile, MENTION_LIST_FILE_PATH } = require('./file_reader.js');

const client = new Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
  if (message.content === `Who's in?`) {
    inOrOutPing(message);
  } else {
    commands.attemptCommandEvaluation(message);
  }
});

function inOrOutPing(message) {
  readInFile(MENTION_LIST_FILE_PATH, (data) => {
    const mentionsList = JSON.parse(data);
    const embedMessage = new MessageEmbed()
      .setTitle('Who\'s in?')
      .setColor('0xffe000')
      .setDescription('React to this message to mark that you\'re in or out for tonight!');
    const messageContent = `${commands.getHumanReadableMentionsList(mentionsList)} are you in?`;

    message.channel.send({ content: messageContent, embed: embedMessage })
      .then((embededMessage) => {
        embededMessage.react('👍');
        embededMessage.react('👎');

        const filter = (reaction, user) => {
          return ['👍', '👎'].includes(reaction.emoji.name) && user.id !== embededMessage.author.id;
        };
        embededMessage.createReactionCollector(filter, { time: 15000, dispose: true })
          .on('collect', (reaction, user) => {
            if (reaction.emoji.name === '👍') {
              embededMessage.channel.send(`🙋 <@${user.id}> is in!`);
            } else if (reaction.emoji.name === '👎') {
              embededMessage.channel.send(`😢 <@${user.id}> is out!`);
            }
          })
          .on('remove', (reaction, user) => {
            embededMessage.channel.send(`<@${user.id}> removed their choice!`);
          })
          .on('end', collected => console.log(`Collected ${collected.size} items`));
      });
  })
};

client.login(auth.token);
