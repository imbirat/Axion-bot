const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

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
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Moderation',
  description: 'Bulk delete messages, optionally filtered by user',
  permissions: ['Administrator'],
  cooldown: 5,

  async execute(interaction, client) {
    try {
      const amount = interaction.options.getInteger('amount');
      const targetUser = interaction.options.getUser('user');

      const messages = await interaction.channel.messages.fetch({ limit: Math.min(amount, 100) + 1 });

      let deleted;
      if (targetUser) {
        const filtered = messages.filter(m => m.author.id === targetUser.id);
        deleted = await interaction.channel.bulkDelete(filtered, true);
      } else {
        deleted = await interaction.channel.bulkDelete(messages, true);
      }

      const count = deleted.size;
      const reply = await interaction.reply({ embeds: [successEmbed(`Cleared ${count} messages.`)], flags: MessageFlags.Ephemeral });
      setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
    } catch (error) {
      console.error('clear command error:', error);
      if (interaction.replied) {
        await interaction.editReply({ embeds: [errorEmbed(error.message || 'Unknown error')] }).catch(() => {});
      } else {
        await interaction.reply({ embeds: [errorEmbed(error.message || 'Unknown error')] }).catch(() => {});
      }
    }
  },

  async prefixExecute(message, args, client) {
    try {
      const amount = parseInt(args[0], 10);
      if (isNaN(amount) || amount < 1 || amount > 100) {
        return message.reply('Please provide a valid amount (1-100).');
      }

      const targetUser = message.mentions.users.first();
      const messages = await message.channel.messages.fetch({ limit: amount + 1 });

      let deleted;
      if (targetUser) {
        const filtered = messages.filter(m => m.author.id === targetUser.id);
        deleted = await message.channel.bulkDelete(filtered, true);
      } else {
        deleted = await message.channel.bulkDelete(messages, true);
      }

      const count = deleted.size;
      const reply = await message.channel.send({ embeds: [successEmbed(`Cleared ${count} messages.`)] });
      setTimeout(() => reply.delete().catch(() => {}), 5000);
    } catch (error) {
      console.error('clear prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
