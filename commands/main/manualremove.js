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
    const groupchat = interaction.options.getChannel("channel");

    if (!member) {
      return await interaction.reply({
        content: `Invalid user.`,
        ephemeral: false,
      });
    }
    if (!groupchat) {
      return await interaction.reply({
        content: `No channel was found.`,
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

    const channelRole = guild.roles.cache.find(
      (role) => role.name == groupchat.name
    );

    const formattedGroupName = capitalizeFirstLetters(
      groupchat.name.replaceAll("-", " ")
    );

    const isUserInGroupchat = guild.members.cache
      .get(member.id)
      .roles.cache.some((role) => role.name == groupchat.name);

    if (!isUserInGroupchat) {
      return await interaction.reply({
        content: `Error: User <@${member.id}> is not in the given groupchat: "${formattedGroupName}".`,
        ephemeral: true,
      });
    }

    await guild.members.cache.get(member.id).roles.remove(channelRole);

    return await interaction.reply({
      content: `User <@${member.id}> has been removed from the following groupchat: "${formattedGroupName}".`,
      ephemeral: true,
    });
  },
};
