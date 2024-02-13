const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  PermissionsBitField,
  ChannelType,
  Colors,
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
        const groupchatChannelRegex = /^groupchat-\d+$/;
        const channelsMap = guild.channels.cache.filter((channel) =>
          groupchatChannelRegex.test(channel.name)
        );
        const channels = [...channelsMap];

        const groupchatCategory = "1204725402816348170";
        const newGroupchatName = `groupchat-${channels.length + 1}`;

        const newRole = await guild.roles.create({
          name: newGroupchatName,
          color: Colors.Blurple,
          reason: `Create role for "${newGroupchatName}" chatroom.`,
        });
        const newChannel = await guild.channels.create({
          name: newGroupchatName,
          type: ChannelType.GuildText,
          parent: groupchatCategory,
        });

        newChannel.permissionOverwrites.set([
          {
            id: newRole.id,
            allow: [PermissionsBitField.Flags.ViewChannel],
            allow: [PermissionsBitField.Flags.SendMessages],
            allow: [PermissionsBitField.Flags.ReadMessageHistory],
          },
          {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
            deny: [PermissionsBitField.Flags.SendMessages],
            deny: [PermissionsBitField.Flags.ReadMessageHistory],
          },
        ]);
        guild.members.cache.get(member.id).roles.add(newRole);

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
