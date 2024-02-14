const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "remove",
  category: "main",
  permissions: [],
  devCommand: false,
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove a specified user from a groupchat.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to remove from a groupchat.")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The groupchat to remove said user from.")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const guild = interaction.guild;
    const member = interaction.options.getUser("user");
    const channel = interaction.options.getChannel("channel");

    if (!member) {
      return await interaction.reply({
        content: `Invalid user.`,
        ephemeral: true,
      });
    }
    if (!channel) {
      return await interaction.reply({
        content: `No channel was found.`,
        ephemeral: true,
      });
    }

    const channelRole = guild.roles.cache.find(
      (role) => role.name == channel.name
    );

    await guild.members.cache.get(member.id).roles.remove(channelRole);

    return await interaction.reply({
      content: `${member.tag} given user has been removed from the following groupchat: "${channel.name}".`,
      ephemeral: true,
    });
  },
};
