const { Client, GatewayIntentBits } = require('discord.js');

const auth = require('./auth.json');
const commands = require('./commands.js');
const { scheduleRollCall } = require('./rollcall.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
  ],
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  scheduleRollCall(client);
});

client.on('messageCreate', message => {
  commands.attemptCommandEvaluation(message);
});

client.login(auth.token);
