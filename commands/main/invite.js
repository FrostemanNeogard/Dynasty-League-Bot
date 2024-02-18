const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  PermissionsBitField,
  ChannelType,
  Colors,
  InteractionCollector,
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

    const groupchatChannelRegex = /^groupchat-\d+$/;

    const userInGroupchatEmbed = new EmbedBuilder()
      .setTitle("Groupchat Invitation")
      .setDescription("You are already in a groupchat.");

    const isUserInGroupchat = guild.members.cache
      .get(member.id)
      .roles.cache.some((role) => groupchatChannelRegex.test(role.name));
    console.log("Is in chat:", isUserInGroupchat);

    if (isUserInGroupchat) {
      return interaction.reply({
        ephemeral: true,
        embeds: [userInGroupchatEmbed],
        components: [],
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("Groupchat Invitation")
      .setDescription(`Would you like to join a groupchat?`);

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
        time: 20_000,
      });

      if (confirmation.customId === "join") {
        const channels = [];
        guild.channels.cache.filter((channel) => {
          if (groupchatChannelRegex.test(channel.name)) {
            console.log("PUSHING CHANNEL:", channel.name);
            return channels.push(channel);
          }
        });

        let groupchatCategory = guild.channels.cache.filter((channel) => {
          return channel.name == "GROUPCHATS";
        });
        groupchatCategory = groupchatCategory.entries().next().value[0];

        // Determine if a channel with an available spot already exists
        let channel;
        for (let i = 0; i < channels.length; i++) {
          const respectiveRole = await guild.roles.cache.find(
            (role) => role.name === channels[i].name
          );
          const memberCount = respectiveRole ? respectiveRole.members.size : 0;
          console.log(
            `Member count for ${respectiveRole.name}: ${memberCount}`
          );
          if (memberCount < 2) {
            console.log(`Setting channel to ${channels[i].name}`);
            channel = channels[i];
            break;
          }
        }

        let newGroupchatName;
        if (!channel) {
          newGroupchatName = `groupchat-${channels.length}`;
          let role = guild.roles.cache.find(
            (role) => role.name === newGroupchatName
          );
          if (!role) {
            role = await createRole(newGroupchatName);
          }
          await guild.members.cache.get(member.id).roles.add(role);
          await createChannel(newGroupchatName, groupchatCategory, role.id);
        } else {
          newGroupchatName = channel.name;
          let role = guild.roles.cache.find(
            (role) => role.name === newGroupchatName
          );
          if (!role) {
            role = await createRole(newGroupchatName);
          }
          await guild.members.cache.get(member.id).roles.add(role);
        }

        // Update initial message
        const acceptEmbed = new EmbedBuilder()
          .setTitle("Groupchat Invitation")
          .setDescription(`You've successfully joined ${newGroupchatName}!`);

        await confirmation.update({
          embeds: [acceptEmbed],
          components: [],
        });
      } else if (confirmation.customId === "cancel") {
        // If user pressed "decline", update the message to inform them about the declined invitation, then do nothing
        const declineEmbed = new EmbedBuilder()
          .setTitle("Groupchat Invitation")
          .setDescription(`This invitation has been declined.`);

        await confirmation.update({
          embeds: [declineEmbed],
          components: [],
        });
      }
    } catch (e) {
      console.error(`Error: ${e}`);

      const timeoutEmbed = new EmbedBuilder()
        .setTitle("Groupchat Invitation")
        .setDescription(`This invitation has expired.`);

      // Catch any errors that may occurr, and handle invitation timeout
      await interaction.editReply({
        embeds: [timeoutEmbed],
        components: [],
      });
    }

    async function createRole(roleName, color = Colors.Blurple) {
      console.log(`Creating a role with the name "${roleName}."`);
      return await guild.roles.create({
        name: roleName,
        color: color,
        reason: `Create role for "${roleName}" chatroom.`,
      });
    }

    async function createChannel(channelName, channelParent, roleId) {
      console.log(`Creating a channel with the name "${channelName}."`);
      return await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: channelParent,
        permissionOverwrites: [
          {
            id: roleId,
            allow: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
        ],
      });
    }
  },
};
