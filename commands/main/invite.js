const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  name: "invite",
  category: "main",
  permissions: [],
  devCommand: true,
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Send an embed with a button to join a group chat."),
  async execute(interaction, client) {
    const guild = interaction.guild;
    const channel = guild.channels.cache.find(
      (channel) => channel.name === "groupchat-1"
    );
    const member = interaction.user;

    const embed = new EmbedBuilder()
      .setTitle("Groupchat Invitation")
      .setDescription("Would you like to join groupchat #1?");

    const joinButton = new ButtonBuilder()
      .setCustomId("join")
      .setLabel("Join")
      .setStyle(ButtonStyle.Success);

    const cancelButton = new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel("Decline")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(joinButton, cancelButton);

    const response = await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });

    const collectorFilter = (i) => i.user.id === interaction.user.id;

    try {
      const confirmation = await response.awaitMessageComponent({
        filter: collectorFilter,
        time: 600_000,
      });

      if (confirmation.customId === "join") {
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
        await confirmation.update({
          content: "Invitation accepted!",
          components: [],
        });
      } else if (confirmation.customId === "cancel") {
        await confirmation.update({
          content: "Invitation declined.",
          components: [],
        });
      }
    } catch (e) {
      await interaction.editReply({
        content: "This invitation has expired.",
      });
    }
  },
};
