const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { capitalizeFirstLetters } = require("../../util/functions");

module.exports = {
  name: "manualremove",
  category: "main",
  permissions: [],
  devCommand: false,
  data: new SlashCommandBuilder()
    .setName("manualremove")
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

    const formattedGroupName = capitalizeFirstLetters(
      channel.name.replaceAll("-", " ")
    );

    const isUserInGroupchat = guild.members.cache
      .get(member.id)
      .roles.cache.some((role) => role.name == channel.name);

    if (!isUserInGroupchat) {
      return await interaction.reply({
        content: `Error: User <@${member.id}> is not in the given groupchat: "${formattedGroupName}".`,
        ephemeral: false,
      });
    }

    await guild.members.cache.get(member.id).roles.remove(channelRole);

    return await interaction.reply({
      content: `User <@${member.id}> has been removed from the following groupchat: "${formattedGroupName}".`,
      ephemeral: false,
    });
  },
};
