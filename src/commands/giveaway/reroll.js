const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const Giveaway = require('../../models/Giveaway');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway-reroll')
    .setDescription('Reroll winners for a giveaway')
    .addStringOption(opt =>
      opt.setName('message-id')
        .setDescription('Message ID of the giveaway')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Giveaway',
  description: 'Reroll winners from existing entries',
  permissions: ['Administrator'],
  cooldown: 10,
  async execute(interaction, client) {
    try {
      const messageId = interaction.options.getString('message-id');
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const giveaway = await Giveaway.findOne({ messageId, guildId: interaction.guild.id });
      if (!giveaway) {
        return interaction.editReply({ content: 'Giveaway not found.' });
      }

      if (!giveaway.ended) {
        return interaction.editReply({ content: 'Giveaway has not ended yet. End it first.' });
      }

      const validEntries = giveaway.entries.filter(e => e);
      if (validEntries.length === 0) {
        return interaction.editReply({ content: 'No entries to reroll.' });
      }

      let winners = [];
      const shuffled = validEntries.sort(() => 0.5 - Math.random());
      winners = shuffled.slice(0, Math.min(giveaway.winners, shuffled.length));

      const channel = client.channels.cache.get(giveaway.channelId);
      if (channel) {
        const winnerMentions = winners.map(id => `<@${id}>`).join(', ');
        await channel.send({
          content: `🎉 **Giveaway Reroll!**\nPrize: **${giveaway.prize}**\nNew Winner(s): ${winnerMentions}\nHosted by: <@${giveaway.hostedBy}>`,
        });
      }

      await interaction.editReply({ content: '✅ Giveaway rerolled.' });
    } catch (error) {
      console.error('giveaway-reroll error:', error);
      if (interaction.deferred) {
        await interaction.editReply({ content: 'There was an error executing this command.' });
      } else {
        await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
      }
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const messageId = args[0];
      if (!messageId) return message.reply('Usage: giveaway-reroll <messageId>');

      const giveaway = await Giveaway.findOne({ messageId, guildId: message.guild.id });
      if (!giveaway) return message.reply('Giveaway not found.');
      if (!giveaway.ended) return message.reply('Giveaway has not ended yet.');

      const validEntries = giveaway.entries.filter(e => e);
      if (validEntries.length === 0) return message.reply('No entries to reroll.');

      const shuffled = validEntries.sort(() => 0.5 - Math.random());
      const winners = shuffled.slice(0, Math.min(giveaway.winners, shuffled.length));

      const channel = client.channels.cache.get(giveaway.channelId);
      if (channel) {
        const winnerMentions = winners.map(id => `<@${id}>`).join(', ');
        await channel.send({
          content: `🎉 **Giveaway Reroll!**\nPrize: **${giveaway.prize}**\nNew Winner(s): ${winnerMentions}\nHosted by: <@${giveaway.hostedBy}>`,
        });
      }

      await message.reply('✅ Giveaway rerolled.');
    } catch (error) {
      console.error('giveaway-reroll prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
