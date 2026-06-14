const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits , MessageFlags} = require('discord.js');
const ReactionRole = require('../../models/ReactionRole');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buttonrole')
    .setDescription('Create a button role')
    .addSubcommand(sub =>
      sub.setName('create')
        .setDescription('Create a button role message'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Reaction Role',
  usage: '/buttonrole create',
  description: 'Opens a modal to create a button role message',
  permissions: ['Administrator'],
  cooldown: 10,
  async execute(interaction, client) {
    try {
      const modalId = `br_create_${interaction.user.id}`;
      const modal = new ModalBuilder()
        .setCustomId(modalId)
        .setTitle('Create Button Role')
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
              .setCustomId('label')
              .setLabel('Button Label')
              .setStyle(TextInputStyle.Short)
              .setPlaceholder('Role name')
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('emoji')
              .setLabel('Emoji')
              .setStyle(TextInputStyle.Short)
              .setPlaceholder(':star: or ⭐')
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('role')
              .setLabel('Role')
              .setStyle(TextInputStyle.Short)
              .setPlaceholder('@role or role ID')
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('color')
              .setLabel('Color (Primary / Danger / Success)')
              .setStyle(TextInputStyle.Short)
              .setPlaceholder('Primary')
              .setRequired(true)
          )
        );

      if (!client.modals) client.modals = new Map();
      client.modals.set(modalId, {
        async execute(modalInteraction) {
          try {
            const channelRaw = modalInteraction.fields.getTextInputValue('channel');
            const label = modalInteraction.fields.getTextInputValue('label');
            const emoji = modalInteraction.fields.getTextInputValue('emoji');
            const roleRaw = modalInteraction.fields.getTextInputValue('role');
            const colorRaw = modalInteraction.fields.getTextInputValue('color').toLowerCase();

            let channel;
            const channelMatch = channelRaw.match(/<#(\d+)>/);
            if (channelMatch) {
              channel = modalInteraction.guild.channels.cache.get(channelMatch[1]);
            } else {
              channel = modalInteraction.guild.channels.cache.get(channelRaw);
            }
            if (!channel) {
              return modalInteraction.reply({ content: 'Invalid channel.', flags: MessageFlags.Ephemeral });
            }

            const roleMatch = roleRaw.match(/<@&(\d+)>/);
            const roleId = roleMatch ? roleMatch[1] : roleRaw;
            const role = modalInteraction.guild.roles.cache.get(roleId);
            if (!role) {
              return modalInteraction.reply({ content: 'Invalid role.', flags: MessageFlags.Ephemeral });
            }

            const colorMap = { primary: ButtonStyle.Primary, danger: ButtonStyle.Danger, success: ButtonStyle.Success };
            const style = colorMap[colorRaw] || ButtonStyle.Primary;

            const button = new ButtonBuilder()
              .setCustomId(`br_${role.id}`)
              .setLabel(label)
              .setStyle(style)
              .setEmoji(emoji);

            const row = new ActionRowBuilder().addComponents(button);

            const msg = await channel.send({ content: 'Click the button to get the role!', components: [row] });

            await ReactionRole.create({
              guildId: modalInteraction.guild.id,
              messageId: msg.id,
              channelId: channel.id,
              roles: [{ emoji, roleId: role.id, label }],
              type: 'button'
            });

            await modalInteraction.reply({ content: '✅ Button role created.', flags: MessageFlags.Ephemeral });
          } catch (err) {
            console.error('buttonrole modal error:', err);
            await modalInteraction.reply({ content: 'An error occurred.', flags: MessageFlags.Ephemeral });
          } finally {
            client.modals.delete(modalId);
          }
        }
      });

      setTimeout(() => client.modals?.delete(modalId), 300000);
      await interaction.showModal(modal);
    } catch (error) {
      console.error('buttonrole error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const channel = message.mentions.channels.first() || message.channel;
      const label = args[1];
      const emoji = args[2];
      const role = message.mentions.roles.first();
      const colorRaw = args[4] ? args[4].toLowerCase() : 'primary';

      if (!label || !emoji || !role) {
        return message.reply('Usage: buttonrole create <#channel> <label> <emoji> <@role> [Primary|Danger|Success]');
      }

      const colorMap = { primary: ButtonStyle.Primary, danger: ButtonStyle.Danger, success: ButtonStyle.Success };
      const style = colorMap[colorRaw] || ButtonStyle.Primary;

      const button = new ButtonBuilder()
        .setCustomId(`br_${role.id}`)
        .setLabel(label)
        .setStyle(style)
        .setEmoji(emoji);

      const row = new ActionRowBuilder().addComponents(button);
      const msg = await channel.send({ content: 'Click the button to get the role!', components: [row] });

      await ReactionRole.create({
        guildId: message.guild.id,
        messageId: msg.id,
        channelId: channel.id,
        roles: [{ emoji, roleId: role.id, label }],
        type: 'button'
      });

      await message.reply('✅ Button role created.');
    } catch (error) {
      console.error('buttonrole prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  }
};
