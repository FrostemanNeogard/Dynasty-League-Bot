const { SlashCommandBuilder, ReactionUserManager } = require("discord.js");
const { capitalizeFirstLetters } = require("../../util/functions");

module.exports = {
  name: "leave",
  category: "main",
  permissions: [],
  devCommand: false,
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leave a specified groupchat.")
    .addChannelOption((option) =>
      option
        .setName("groupchat")
        .setDescription("The groupchat to leave.")
        .setRequired(true)
    )
    .setDMPermission(false),
  async execute(interaction, client) {
    const guild = interaction.guild;
    const member = interaction.member;
    const groupchat = interaction.options.getChannel("groupchat");

    if (!member) {
      return await interaction.reply({
        content: `Error: No user was provided.`,
        ephemeral: false,
      });
    }
    if (!groupchat) {
      return await interaction.reply({
        content: `Error: No groupchat was provided.`,
        ephemeral: false,
      });
    }

    const groupchatChannelRegex = /^dynasty-league-\d+$/;
    if (!groupchatChannelRegex.test(groupchat.name)) {
      return await interaction.reply({
        content: `Error: Selected channel must be a Dynasty League groupchat.`,
        ephemeral: false,
      });
    }

    const groupchatRoles = member.roles.cache.find((role) =>
      groupchatChannelRegex.test(role.name)
    );

    if (!groupchatRoles) {
      return await interaction.reply({
        content: `Error: You are not in any groupchats.`,
        ephemeral: false,
      });
    }

    const channelRole = guild.roles.cache.find(
      (role) => role.name == groupchat.name
    );

    await guild.members.cache.get(member.id).roles.remove(channelRole);

    const formattedGroupname = capitalizeFirstLetters(
      groupchat.name.replaceAll("-", " ")
    );

    return await interaction.reply({
      content: `You have been successfully removed from the "${formattedGroupname}" groupchat.`,
      ephemeral: false,
    });
  },
};
