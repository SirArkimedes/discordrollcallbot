const { Client, MessageEmbed, MessageReaction } = require('discord.js');
const auth = require('./auth.json');

const client = new Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
  if (message.content === 'fuck you') {
    message.channel.send('No fuck you');
  }
});

client.on('message', message => {
  if (message.content === 'ping') {
    const embed = new MessageEmbed()
      .setTitle('Who\'s in?')
      .setColor('0xffe000')
      .setDescription('React to this message to mark that you\'re in for tonight!');

      message.channel.send(embed).then((sentMessage, something) => {
        sentMessage.react('👍');
        const filter = (reaction, user) => {
          return ['👍', '👎'].includes(reaction.emoji.name);
        };

        sentMessage.awaitReactions(filter, { max: 2, time: 60000, errors: ['time'] })
        .then(collected => {
          const reaction = collected.first();
          message.channel.send('Someone reacted.');

          if (reaction.emoji.name === '👍') {
            message.channel.send('you reacted with a thumbs up.');
          } else {
            message.channel.send('you reacted with a thumbs down.');
          }
        })
        .catch(collected => {
          message.channel.send('you reacted with neither a thumbs up, nor a thumbs down.');
        });
      });
    }
  });

client.login(auth.token);
