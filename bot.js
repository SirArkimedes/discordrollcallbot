const { Client } = require('discord.js');

const auth = require('./auth.json');
const commands = require('./commands.js');
const { scheduleRollCall } = require('./rollcall.js');

const client = new Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  scheduleRollCall(client);
});

client.on('message', message => {
  commands.attemptCommandEvaluation(message);
});

client.login(auth.token);
