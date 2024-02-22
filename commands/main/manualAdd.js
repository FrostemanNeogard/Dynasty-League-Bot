const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

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
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),

  async execute(interaction, client) {
    const guild = interaction.guild;
    const member = interaction.options.getUser("user");
    const channel = interaction.options.getChannel("channel");

    if (!member) {
      return await interaction.reply({
        content: `Invalid user.`,
        ephemeral: false,
      });
    }
    if (!channel) {
      return await interaction.reply({
        content: `No channel was found.`,
        ephemeral: false,
      });
    }

    const channelRole = guild.roles.cache.find(
      (role) => role.name == channel.name
    );

    const isUserInGroupchat = guild.members.cache
      .get(member.id)
      .roles.cache.some((role) => role.name == channel.name);

    if (isUserInGroupchat) {
      return await interaction.reply({
        content: `Error: User <@${member.id}> is already in the given groupchat: "${channel.name}".`,
        ephemeral: false,
      });
    }

    await guild.members.cache.get(member.id).roles.add(channelRole);
    return await interaction.reply({
      content: `User <@${member.id}> has been added to the following groupchat: "${channel.name}".`,
      ephemeral: false,
    });
  },
};
