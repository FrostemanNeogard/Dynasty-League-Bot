require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const TOKEN = process.env.TOKEN;

// Set up discord client (with intents due to API changes)
const Discord = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Create bot object
let bot = {
  client,
};

// Collections for commands and events
client.commands = new Discord.Collection();
client.events = new Discord.Collection();

client.loadEvents = (bot, reload) => require("./handlers/events")(bot, reload);
client.loadCommands = (bot, reload) =>
  require("./handlers/commands")(bot, reload);

// Run the functions created above
client.loadEvents(bot, false);
client.loadCommands(bot, false);

module.exports = bot;

// Client login
client.login(TOKEN);
