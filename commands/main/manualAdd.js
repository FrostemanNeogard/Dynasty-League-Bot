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
        id: guild.id,
        deny: [PermissionsBitField.Flags.SendMessages],
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
      {
        id: member.id,
        allow: [PermissionsBitField.Flags.SendMessages],
        allow: [PermissionsBitField.Flags.ViewChannel],
      },
    ]);

    return await interaction.reply({
      content: `${member.tag} given user has been added from the following channel: "${channelName}".`,
      ephemeral: true,
    });
  },
};
