const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "manualadd",
  category: "main",
  permissions: [],
  devCommand: false,
  data: new SlashCommandBuilder()
    .setName("manualadd")
    .setDescription("Add a specified user to a groupchat.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to add to a groupchat.")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The groupchat to add user to.")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const guild = interaction.guild;
    const member = interaction.options.getUser("user");
    const channel = interaction.options.getUser("channel");

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

    await guild.members.cache.get(member.id).roles.add(channelRole);

    return await interaction.reply({
      content: `${member.tag} given user has been added from the following channel: "${channelName}".`,
      ephemeral: true,
    });
  },
};
