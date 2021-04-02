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

      message.channel.send(embed)
      .then((embededMessage, something) => {
        embededMessage.react('👍');

        const filter = (reaction, user) => {
          return ['👍', '👎'].includes(reaction.emoji.name) && user.id !== embededMessage.author.id;
        };
        embededMessage.createReactionCollector(filter, { time: 15000, dispose: true })
        .on('collect', (reaction, user) => {
          if (reaction.emoji.name === '👍') {
            embededMessage.channel.send('You reacted with a thumbs up.');
          }
        })
        .on('remove', (reaction, user) => {
          embededMessage.channel.send('Someone is out!');
        })
        .on('end', collected => console.log(`Collected ${collected.size} items`));
      });
    }
  });

client.login(auth.token);
