const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  name: "invite",
  category: "main",
  permissions: [],
  devCommand: true,
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Send an embed with a button to join a group chat."),
  async execute(interaction) {
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
    });

    const collectorFilter = (i) => i.user.id === interaction.user.id;

    try {
      const confirmation = await response.awaitMessageComponent({
        filter: collectorFilter,
        time: 0,
      });

      if (confirmation.customId === "join") {
        console.log("Pressed join!");
        disableButtons();
        await confirmation.update({
          content: "Invitation accepted!",
          components: [],
        });
      } else if (confirmation.customId === "cancel") {
        disableButtons();
        console.log("Cancelling!");
        await confirmation.update({
          content: "Invitation declined.",
          components: [],
        });
      }
    } catch (e) {
      await interaction.editReply({
        content: "Confirmation not received within 1 minute, cancelling",
      });
    }

    function disableButtons() {
      joinButton.setDisabled(true);
      cancelButton.setDisabled(true);
    }
  },
};
