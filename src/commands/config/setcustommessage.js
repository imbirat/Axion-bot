const { SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder , MessageFlags} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setcustommessage')
    .setDescription('Customize welcome, farewell, or booster messages')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of message to customize')
        .setRequired(true)
        .addChoices(
          { name: 'Welcome', value: 'welcome' },
          { name: 'Farewell', value: 'farewell' },
          { name: 'Booster', value: 'booster' }
        )
    ),
  category: 'Config',
  usage: '/setcustommessage <type>',
  description: 'Customize the welcome, farewell, or booster message for your server',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const type = interaction.options.getString('type');
      const modal = new ModalBuilder()
        .setCustomId('custommessage_modal')
        .setTitle(`Set ${type.charAt(0).toUpperCase() + type.slice(1)} Message`);
      const typeInput = new TextInputBuilder()
        .setCustomId('type')
        .setLabel('Message Type')
        .setStyle(TextInputStyle.Short)
        .setValue(type)
        .setRequired(true);
      const messageInput = new TextInputBuilder()
        .setCustomId('message')
        .setLabel('Message Body')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Enter your custom message...')
        .setRequired(true);
      const embedInput = new TextInputBuilder()
        .setCustomId('embed')
        .setLabel('Send as Embed? (true/false)')
        .setStyle(TextInputStyle.Short)
        .setValue('false')
        .setRequired(true);
      const row1 = new ActionRowBuilder().addComponents(typeInput);
      const row2 = new ActionRowBuilder().addComponents(messageInput);
      const row3 = new ActionRowBuilder().addComponents(embedInput);
      modal.addComponents(row1, row2, row3);
      await interaction.showModal(modal);
    } catch (error) {
      console.error('setcustommessage command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const type = args[0]?.toLowerCase();
      const validTypes = ['welcome', 'farewell', 'booster'];
      if (!type || !validTypes.includes(type)) return message.reply('Usage: setcustommessage <welcome|farewell|booster>');
      const modal = new ModalBuilder()
        .setCustomId('custommessage_modal')
        .setTitle(`Set ${type.charAt(0).toUpperCase() + type.slice(1)} Message`);
      const typeInput = new TextInputBuilder()
        .setCustomId('type')
        .setLabel('Message Type')
        .setStyle(TextInputStyle.Short)
        .setValue(type)
        .setRequired(true);
      const messageInput = new TextInputBuilder()
        .setCustomId('message')
        .setLabel('Message Body')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Enter your custom message...')
        .setRequired(true);
      const embedInput = new TextInputBuilder()
        .setCustomId('embed')
        .setLabel('Send as Embed? (true/false)')
        .setStyle(TextInputStyle.Short)
        .setValue('false')
        .setRequired(true);
      const row1 = new ActionRowBuilder().addComponents(typeInput);
      const row2 = new ActionRowBuilder().addComponents(messageInput);
      const row3 = new ActionRowBuilder().addComponents(embedInput);
      modal.addComponents(row1, row2, row3);
      await message.channel.send({ content: 'Please use the slash command `/setcustommessage` to open the message customization modal.' });
    } catch (error) {
      console.error('setcustommessage prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
