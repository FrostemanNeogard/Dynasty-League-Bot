const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "remove",
  category: "main",
  permissions: [],
  devCommand: false,
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove a specified user from their respective groupchat.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to remove.")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const guild = interaction.guild;
    const member = interaction.options.getUser("user");
    const channelName = "groupchat-1";
    const channel = guild.channels.cache.find(
      (channel) => channel.name === channelName
    );

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

    channel.permissionOverwrites.set([
      {
        id: member.id,
        deny: [PermissionsBitField.Flags.SendMessages],
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
    ]);

    return await interaction.reply({
      content: `The given user has been removed from the following channel: "${channelName}".`,
      ephemeral: true,
    });
  },
};
