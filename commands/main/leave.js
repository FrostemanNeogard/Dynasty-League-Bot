const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "leave",
  category: "main",
  permissions: [],
  devCommand: false,
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leave your assigned groupchat."),

  async execute(interaction, client) {
    const guild = interaction.guild;
    const member = interaction.member;

    if (!member) {
      return await interaction.reply({
        content: `Invalid user.`,
        ephemeral: true,
      });
    }

    const groupchatChannelRegex = /^groupchat-\d+$/;
    const groupchatRoles = member.roles.cache.find((role) =>
      groupchatChannelRegex.test(role.name)
    );

    if (!groupchatRoles) {
      return await interaction.reply({
        content: `You are not in any groupchats.`,
        ephemeral: true,
      });
    }

    const groupchatName = groupchatRoles.name;

    const channelRole = guild.roles.cache.find(
      (role) => role.name == groupchatName
    );

    await guild.members.cache.get(member.id).roles.remove(channelRole);

    return await interaction.reply({
      content: `You have been successfully removed from the following groupchat: ${groupchatName}.`,
      ephemeral: true,
    });
  },
};
