const { SlashCommandBuilder } = require("discord.js");

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
    ),

  async execute(interaction, client) {
    const guild = interaction.guild;
    const member = interaction.member;
    const groupchat = interaction.options.getChannel("groupchat");

    if (!member) {
      return await interaction.reply({
        content: `Invalid user.`,
        ephemeral: false,
      });
    }
    if (!groupchat) {
      return await interaction.reply({
        content: `No groupchat was found.`,
        ephemeral: false,
      });
    }

    const groupchatChannelRegex = /^groupchat-\d+$/;
    const groupchatRoles = member.roles.cache.find((role) =>
      groupchatChannelRegex.test(role.name)
    );

    if (!groupchatRoles) {
      return await interaction.reply({
        content: `You are not in any groupchats.`,
        ephemeral: false,
      });
    }

    const channelRole = guild.roles.cache.find(
      (role) => role.name == groupchat.name
    );

    await guild.members.cache.get(member.id).roles.remove(channelRole);

    return await interaction.reply({
      content: `You have been successfully removed from the following groupchat: ${groupchat}.`,
      ephemeral: false,
    });
  },
};
