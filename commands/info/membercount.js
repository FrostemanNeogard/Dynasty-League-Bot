const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { embed_color } = require("../../config.json");
const { capitalizeFirstLetters } = require("../../util/functions");

module.exports = {
  name: "membercount",
  category: "info",
  permissions: [],
  devCommand: false,
  data: new SlashCommandBuilder()
    .setName("membercount")
    .setDescription(`Replies the member count of a given groupchat.`)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The groupchat view the member count for.")
        .setRequired(true)
    )
    .setDMPermission(false),

  async execute(interaction) {
    const guild = interaction.guild;
    const groupchat = interaction.options.getChannel("channel");

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

    const channelRole = (await guild.roles.fetch()).find(
      (role) => role.name == groupchat.name
    );

    const formattedGroupName = capitalizeFirstLetters(
      groupchat.name.replaceAll("-", " ")
    );
    const memberCount = channelRole.members.size;

    const responseEmbed = new EmbedBuilder()
      .setTitle(`Member Count`)
      .setDescription(
        `The current member count for "${formattedGroupName}" is: ${memberCount}`
      )
      .setColor(embed_color);

    return await interaction.reply({
      embeds: [responseEmbed],
      ephemeral: false,
    });
  },
};
