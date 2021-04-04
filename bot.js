const { Client } = require('discord.js');

const auth = require('./auth.json');
const commands = require('./commands.js');
const { rollCall } = require('./rollcall.js');

const client = new Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
  if (message.content === 'w') {
    rollCall(client);
  } else {
    commands.attemptCommandEvaluation(message);
  }
});

client.login(auth.token);
