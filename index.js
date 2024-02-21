// Set up the login token as well as the owner ID
require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { owner_id } = require("./config.json");
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
// Contains the client as well as additional information for command the bot owner's ID
let bot = {
  client,
  owner: owner_id,
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
