const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { capitalizeFirstLetters } = require("../../util/functions");

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
    const groupchat = interaction.options.getChannel("channel");

    if (!member) {
      return await interaction.reply({
        content: `Error: No user was provided.`,
        ephemeral: false,
      });
    }
    if (!groupchat) {
      return await interaction.reply({
        content: `Error: No channel was provided.`,
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

    if (isUserInGroupchat) {
      return await interaction.reply({
        content: `Error: User <@${member.id}> is already in the given groupchat: "${formattedGroupName}".`,
        ephemeral: false,
      });
    }

    await guild.members.cache.get(member.id).roles.add(channelRole);
    return await interaction.reply({
      content: `User <@${member.id}> has been added to the following groupchat: "${formattedGroupName}".`,
      ephemeral: false,
    });
  },
};
