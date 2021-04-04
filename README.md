# Discord Roll Call Bot
* Tired of always asking if a group of people are down to play that night? We were too.
* Introducing Discord Roll Call Bot! A one-stop-shop for asking your friends if they're down at that same particular date and time.

# How to run
### Requirement
* Node

### Setup process
1. Run `npm install`.
2. Create a bot with Discord [here](https://discordapp.com/developers/applications/me).
3. Invite the newly created bot to a server with this link, replacing CLIENT with your bot's client ID: https://discordapp.com/oauth2/authorize?client_id=CLIENT&scope=bot
4. Copy the bot's OAuth token from the Discord dashboard at the link in step 2.
5. Create an `auth.json` file in the root folder with the following format and where the bot token can be found in the Discord dashboard:
  ` {
      token: "YOUR BOT TOKEN HERE"
  } `
6. Modify the `settings.json` `timeToSendMessage` value to be something in the future. (It uses [Unix Time](https://www.epochconverter.com/).)
6. Run `node bot.js`.

### Usage
1. Once added to your server from the steps in [Setup process](https://github.com/SirArkimedes/discordwhosinbot#setup-process), run `!setChannel` to tell the bot which channel to send the scheduled message.
* Run `!testRollCall` to see what happens!
* Puruse the [Commands](https://github.com/SirArkimedes/discordwhosinbot#commands) section to apply any other customizations!

### Commands
* `!scheduledMentionAdd {username(s)}` - Adds an @'d list of users to the roll call list. (Will later mention them in the roll call message if they're in this list.)
* `!scheduledMentionRemove {username(s)}` - Removes an @'d list of users to the roll call list.
* `!showMentionsList` - Displays who is in the mention list.
* `!setChannel` - Sets the channel at which to send the scheduled roll call to.
* `!testRollCall` - Sends a non-scheduled roll call message.
* `!ping` - Responds with a message to show that the bot is alive and well.

# Thanks!
* This project was made for those that play DnD (among other things...).
* Thanks for checking it out!

<p align="center">
  Made with ❤️ by  <a href="https://github.com/SirArkimedes">SirArkimedes</a> and <a href="https://github.com/JonasESmith">JonasESmith</a>.
</p>
