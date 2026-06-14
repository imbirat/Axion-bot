const { SlashCommandBuilder } = require('discord.js');
const { t } = require('../../utils/i18n');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear messages in the channel')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to clear (max 100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Only clear messages from this user')
        .setRequired(false)
    ),
  category: 'Moderation',
  usage: '/clear <amount> [user]',
  description: 'Bulk delete messages, optionally filtered by user',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const amount = interaction.options.getInteger('amount');
      const targetUser = interaction.options.getUser('user');

      const messages = await interaction.channel.messages.fetch({ limit: amount });

      let deleted;
      if (targetUser) {
        const filtered = messages.filter(m => m.author.id === targetUser.id);
        deleted = await interaction.channel.bulkDelete(filtered, true);
      } else {
        deleted = await interaction.channel.bulkDelete(messages, true);
      }

      const count = deleted.size;
      const reply = await t(interaction.guild.id, 'moderation.clear.success', {
        defaultValue: '✅ Cleared {{count}} messages.',
        count
      });

      const msg = await interaction.reply({ content: reply, fetchReply: true });
      setTimeout(() => msg.delete().catch(() => {}), 5000);
    } catch (error) {
      console.error('clear command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const amount = parseInt(args[0], 10);
      if (isNaN(amount) || amount < 1 || amount > 100) {
        return message.reply('Please provide a valid amount (1-100).');
      }

      const targetUser = message.mentions.users.first();
      const messages = await message.channel.messages.fetch({ limit: amount });

      let deleted;
      if (targetUser) {
        const filtered = messages.filter(m => m.author.id === targetUser.id);
        deleted = await message.channel.bulkDelete(filtered, true);
      } else {
        deleted = await message.channel.bulkDelete(messages, true);
      }

      const count = deleted.size;
      const reply = await message.channel.send(`✅ Cleared ${count} messages.`);
      setTimeout(() => reply.delete().catch(() => {}), 5000);
    } catch (error) {
      console.error('clear prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
