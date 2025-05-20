const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  PermissionsBitField,
  ChannelType,
} = require("discord.js");

const { embed_color } = require("../../config.json");
const { capitalizeFirstLetters } = require("../../util/functions");

module.exports = {
  name: "join-league",
  category: "main",
  permissions: [],
  devCommand: true,
  data: new SlashCommandBuilder()
    .setName("join-league")
    .setDescription("Send an embed with a button to join a group chat.")
    .setDMPermission(false),
  async execute(interaction, client) {
    const guild = interaction.guild;
    const member = interaction.user;

    const groupNamePrefix = "dynasty-league-";
    const groupchatChannelRegex = /^dynasty-league-\d+$/;

    const isUserInGroupchat = guild.members.cache
      .get(member.id)
      .roles.cache.some((role) => groupchatChannelRegex.test(role.name));

    const embed = new EmbedBuilder()
      .setTitle("Groupchat Invitation")
      .setColor(embed_color)
      .setDescription(
        `Would you like to join ${
          isUserInGroupchat ? "another" : "a"
        } groupchat?`
      );

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
        if (confirmation.user.id !== member.id) {
          return;
        }

        await guild.members.fetch();
        const channels = [];
        guild.channels.cache.filter(async (channel) => {
          if (groupchatChannelRegex.test(channel.name)) {
            console.log("PUSHING CHANNEL:", channel.name);
            const isAlreadyInGroupchat = guild.members.cache
              .get(member.id)
              .roles.cache.some((role) => role.name == channel.name);
            if (!isAlreadyInGroupchat) {
              return channels.push(channel);
            }
          }
        });
        channels.sort();

        // Determine if a channel with an available spot already exists
        let channel;
        const roles = await guild.roles.fetch();
        for (let i = 0; i < channels.length; i++) {
          const respectiveRole = roles.find(
            (role) => role.name === channels[i].name
          );

          if (!respectiveRole) {
            continue;
          }

          const memberCount = respectiveRole ? respectiveRole.members.size : 0;
          console.log(
            `Member count for ${
              respectiveRole ? respectiveRole.name : "UNKNOWN"
            }: ${memberCount}`
          );
          if (memberCount < 12) {
            if (Number(channels[i].name.split("-")[2]) <= 48) {
              console.log(`Skipping channel ${channels[i].name}`);
              continue;
            }
            console.log(`Setting channel to ${channels[i].name}`);
            channel = channels[i];
            break;
          }
        }

        let newGroupchatName;
        if (!channel) {
          const allGroupchatChannels = guild.channels.cache.filter((channel) =>
            groupchatChannelRegex.test(channel.name)
          );
          const channelNumber = allGroupchatChannels.size + 1;
          newGroupchatName = `${groupNamePrefix}${channelNumber}`;
          let role = guild.roles.cache.find(
            (role) => role.name === newGroupchatName
          );
          if (!role) {
            role = await createRole(newGroupchatName);
          }
          await guild.members.cache.get(member.id).roles.add(role);

          let groupchatCategory = guild.channels.cache.filter((channel) => {
            return (
              channel.name.toLowerCase() ==
              (channelNumber < 50
                ? "join bdge dynasty league"
                : "dynasty leagues 50 - 100")
            );
          });
          if (groupchatCategory.size === 0) {
            groupchatCategory = null;
          } else {
            groupchatCategory = groupchatCategory.entries().next().value[0];
          }

          const newChannel = await createChannel(
            newGroupchatName,
            groupchatCategory ?? null,
            role.id
          );
          await sendInvitationNotification(newChannel, member);
        } else {
          newGroupchatName = channel.name;
          let role = guild.roles.cache.find(
            (role) => role.name === newGroupchatName
          );
          if (!role) {
            role = await createRole(newGroupchatName);
          }
          await guild.members.cache.get(member.id).roles.add(role);
          await sendInvitationNotification(channel, member);
        }

        // Update initial message
        const formattedGroupName = capitalizeFirstLetters(
          newGroupchatName.replaceAll("-", " ")
        );
        const formattedResponse = `You've successfully joined the "${formattedGroupName}" groupchat!`;
        const acceptEmbed = new EmbedBuilder()
          .setTitle("Groupchat Invitation")
          .setColor(embed_color)
          .setDescription(formattedResponse);

        return await confirmation.update({
          embeds: [acceptEmbed],
          ephemeral: true,
          components: [],
        });
      } else if (confirmation.customId === "cancel") {
        // If user pressed "decline", update the message to inform them about the declined invitation, then do nothing
        const declineEmbed = new EmbedBuilder()
          .setTitle("Groupchat Invitation")
          .setColor(embed_color)
          .setDescription(`This invitation has been declined.`);

        return await confirmation.update({
          embeds: [declineEmbed],
          components: [],
        });
      }
    } catch (e) {
      console.error(`Error: ${e}`);

      const timeoutEmbed = new EmbedBuilder()
        .setTitle("Groupchat Invitation")
        .setColor(embed_color)
        .setDescription(`This invitation has expired.`);

      // Catch any errors that may occurr, and handle invitation timeout
      return await interaction.editReply({
        embeds: [timeoutEmbed],
        components: [],
      });
    }

    async function createRole(roleName) {
      console.log(`Creating a role with the name "${roleName}."`);
      return await guild.roles.create({
        name: roleName,
        reason: `Create role for "${roleName}" chatroom.`,
      });
    }

    async function createChannel(channelName, channelParent, roleId) {
      console.log(`Creating a channel with the name "${channelName}."`);
      // Notify Jared about new group's creation
      const jared = await client.users.fetch("144920733854728192");
      jared.send(`A new groupchat was created with the name "${channelName}".`);

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

    async function sendInvitationNotification(channel, member) {
      const joinedEmbed = new EmbedBuilder().setColor(embed_color).setFields({
        name: "New member!",
        value: `<@${member.id}> has joined this groupchat!`,
      });
      return await channel.send({
        embeds: [joinedEmbed],
      });
    }
  },
};
