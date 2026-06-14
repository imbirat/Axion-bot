const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ReactionRole = require('../../models/ReactionRole');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reactionrole')
    .setDescription('Create a reaction role')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Reaction Role',
  usage: '/reactionrole',
  description: 'Opens a modal to create reaction roles with emoji-role pairs',
  permissions: ['Administrator'],
  cooldown: 10,
  async execute(interaction, client) {
    try {
      const modalId = `rr_create_${interaction.user.id}`;
      const modal = new ModalBuilder()
        .setCustomId(modalId)
        .setTitle('Create Reaction Role')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('channel')
              .setLabel('Channel ID')
              .setStyle(TextInputStyle.Short)
              .setPlaceholder('Paste channel ID or #channel')
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('messageId')
              .setLabel('Message ID (leave blank to create new)')
              .setStyle(TextInputStyle.Short)
              .setPlaceholder('Optional: existing message ID')
              .setRequired(false)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('emojiRoles')
              .setLabel('Emoji -> Role pairs')
              .setStyle(TextInputStyle.Paragraph)
              .setPlaceholder('Format: :emoji: @role or emoji @role, one per line')
              .setRequired(true)
          )
        );

      if (!client.modals) client.modals = new Map();
      client.modals.set(modalId, {
        async execute(modalInteraction) {
          try {
            const channelRaw = modalInteraction.fields.getTextInputValue('channel');
            const messageIdInput = modalInteraction.fields.getTextInputValue('messageId');
            const emojiRolesRaw = modalInteraction.fields.getTextInputValue('emojiRoles');

            let channel;
            const channelMatch = channelRaw.match(/<#(\d+)>/);
            if (channelMatch) {
              channel = modalInteraction.guild.channels.cache.get(channelMatch[1]);
            } else {
              channel = modalInteraction.guild.channels.cache.get(channelRaw);
            }
            if (!channel) {
              return modalInteraction.reply({ content: 'Invalid channel.', ephemeral: true });
            }

            const lines = emojiRolesRaw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            const roles = [];
            for (const line of lines) {
              const parts = line.split(/\s+/);
              if (parts.length < 2) continue;
              const emoji = parts[0];
              const roleMatch = parts[1].match(/<@&(\d+)>/);
              if (!roleMatch) continue;
              const role = modalInteraction.guild.roles.cache.get(roleMatch[1]);
              if (!role) continue;
              roles.push({ emoji, roleId: role.id });
            }

            if (roles.length === 0) {
              return modalInteraction.reply({ content: 'No valid emoji-role pairs found. Use format: `:emoji: @role`', ephemeral: true });
            }

            if (messageIdInput) {
              const msg = await channel.messages.fetch(messageIdInput).catch(() => null);
              if (!msg) {
                return modalInteraction.reply({ content: 'Message not found in that channel.', ephemeral: true });
              }
              for (const r of roles) {
                await msg.react(r.emoji).catch(() => {});
              }
              await ReactionRole.findOneAndUpdate(
                { guildId: modalInteraction.guild.id, messageId: msg.id },
                { $set: { channelId: channel.id, roles, type: 'reaction' }, $setOnInsert: { guildId: modalInteraction.guild.id, messageId: msg.id } },
                { upsert: true }
              );
            } else {
              const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('Reaction Roles')
                .setDescription('React to get a role!\n\n' + roles.map(r => `${r.emoji} → <@&${r.roleId}>`).join('\n'));

              const msg = await channel.send({ embeds: [embed] });
              for (const r of roles) {
                await msg.react(r.emoji).catch(() => {});
              }
              await ReactionRole.create({ guildId: modalInteraction.guild.id, messageId: msg.id, channelId: channel.id, roles, type: 'reaction' });
            }

            await modalInteraction.reply({ content: '✅ Reaction role created.', ephemeral: true });
          } catch (err) {
            console.error('reactionrole modal error:', err);
            await modalInteraction.reply({ content: 'An error occurred.', ephemeral: true });
          } finally {
            client.modals.delete(modalId);
          }
        }
      });

      setTimeout(() => client.modals?.delete(modalId), 300000);
      await interaction.showModal(modal);
    } catch (error) {
      console.error('reactionrole error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const channel = message.mentions.channels.first() || message.channel;
      const emojiRolesRaw = args.slice(1).join(' ');
      if (!emojiRolesRaw) {
        return message.reply('Usage: reactionrole create <#channel> <emoji1> @role1 <emoji2> @role2 ...');
      }

      const parts = emojiRolesRaw.split(/\s+/);
      const roles = [];
      for (let i = 0; i < parts.length; i += 2) {
        const emoji = parts[i];
        const roleMatch = parts[i + 1]?.match(/<@&(\d+)>/);
        if (!roleMatch) continue;
        const role = message.guild.roles.cache.get(roleMatch[1]);
        if (!role) continue;
        roles.push({ emoji, roleId: role.id });
      }

      if (roles.length === 0) {
        return message.reply('No valid emoji-role pairs found.');
      }

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Reaction Roles')
        .setDescription('React to get a role!\n\n' + roles.map(r => `${r.emoji} → <@&${r.roleId}>`).join('\n'));

      const msg = await channel.send({ embeds: [embed] });
      for (const r of roles) {
        await msg.react(r.emoji).catch(() => {});
      }
      await ReactionRole.create({ guildId: message.guild.id, messageId: msg.id, channelId: channel.id, roles, type: 'reaction' });
      await message.reply('✅ Reaction role created.');
    } catch (error) {
      console.error('reactionrole prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  }
};
