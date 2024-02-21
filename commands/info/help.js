const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "help",
  category: "info",
  permissions: [],
  devCommand: false,
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription(
      "Replies with a list of all available commands for this bot."
    ),
  async execute(interaction) {
    const responseEmbed = new EmbedBuilder()
      .setTitle("Help")
      .setDescription("All available commands for this bot.")
      .setFields(
        {
          name: "/invite",
          value: "Recieve an invitation for a groupchat.",
        },
        {
          name: "/leave",
          value: "Leave the groupchat you are currently in.",
        },
        {
          name: "/manualadd",
          value: "(MOD COMMAND) Add any given user to any given groupchat.",
        },
        {
          name: "/manualremove",
          value:
            "(MOD COMMAND) Remove any given user from any given groupchat.",
        }
      );
    await interaction.reply({
      ephemeral: false,
      embeds: [responseEmbed],
    });
  },
};
