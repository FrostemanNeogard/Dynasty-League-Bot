const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  PermissionFlagsBits,
} = require("discord.js");

const { embed_color } = require("../../config.json");

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
    const isMemberPrivileged = interaction.member.permissions.has(
      PermissionFlagsBits.MoveMembers
    );

    const responseEmbed = new EmbedBuilder()
      .setTitle("Help")
      .setDescription("All available commands for this bot.")
      .setColor(embed_color)
      .setFields(
        {
          name: "/invite",
          value: "Recieve an invitation for a groupchat.",
        },
        {
          name: "/leave",
          value: "Leave any specified groupchat you are currently in.",
        }
      );

    if (isMemberPrivileged) {
      responseEmbed.addFields(
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
    }

    await interaction.reply({
      ephemeral: isMemberPrivileged,
      embeds: [responseEmbed],
    });
  },
};
