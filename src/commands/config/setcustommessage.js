const { SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setcustommessage')
    .setDescription('Set a custom message for welcome/farewell/booster')
    .addStringOption(opt =>
      opt.setName('type')
        .setDescription('Message type')
        .setRequired(true)
        .addChoices(
          { name: 'Welcome', value: 'welcome' },
          { name: 'Farewell', value: 'farewell' },
          { name: 'Booster', value: 'booster' }
        ))
    .addStringOption(opt =>
      opt.setName('message')
        .setDescription('Custom message (use {user}, {server} as placeholders)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Config',
  usage: '/setcustommessage <type> [message]',
  description: 'Set custom messages for welcome, farewell, and booster events',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const type = interaction.options.getString('type');
      const message = interaction.options.getString('message');

      if (message) {
        const fieldMap = { welcome: 'welcomeMessage', farewell: 'farewellMessage', booster: 'boosterMessage' };
        await GuildConfig.findOneAndUpdate(
          { guildId: interaction.guild.id },
          { $set: { [fieldMap[type]]: message } },
          { upsert: true }
        );
        const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
        await interaction.reply({ content: `✅ ${typeLabel} message has been updated.`, flags: MessageFlags.Ephemeral });
      } else {
        const modal = new ModalBuilder()
          .setCustomId('custommessage_modal')
          .setTitle('Set Custom Message');

        const typeInput = new TextInputBuilder()
          .setCustomId('type')
          .setLabel('Message Type')
          .setStyle(TextInputStyle.Short)
          .setValue(type)
          .setRequired(true);

        const messageInput = new TextInputBuilder()
          .setCustomId('message')
          .setLabel('Custom Message')
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder('Welcome {user} to {server}!')
          .setRequired(true);

        const embedInput = new TextInputBuilder()
          .setCustomId('embed')
          .setLabel('Use Embed (true/false)')
          .setStyle(TextInputStyle.Short)
          .setValue('false')
          .setRequired(false);

        modal.addComponents(
          new ActionRowBuilder().addComponents(typeInput),
          new ActionRowBuilder().addComponents(messageInput),
          new ActionRowBuilder().addComponents(embedInput)
        );

        await interaction.showModal(modal);
      }
    } catch (error) {
      console.error('setcustommessage command error:', error);
      await interaction.reply({ content: 'There was an error setting the custom message.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const type = args[0]?.toLowerCase();
      const text = args.slice(1).join(' ');
      if (!type || !['welcome', 'farewell', 'booster'].includes(type)) {
        return message.reply('Usage: setcustommessage <welcome|farewell|booster> <message>');
      }
      if (!text) return message.reply('Please provide a message.');
      const fieldMap = { welcome: 'welcomeMessage', farewell: 'farewellMessage', booster: 'boosterMessage' };
      await GuildConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        { $set: { [fieldMap[type]]: text } },
        { upsert: true }
      );
      const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
      await message.reply(`✅ ${typeLabel} message has been updated.`);
    } catch (error) {
      console.error('setcustommessage prefix error:', error);
      await message.reply('There was an error setting the custom message.');
    }
  },
};
