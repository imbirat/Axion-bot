const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const Giveaway = require('../../models/Giveaway');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway-end')
    .setDescription('End a giveaway early and pick winners')
    .addStringOption(opt =>
      opt.setName('message-id')
        .setDescription('Message ID of the giveaway')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Giveaway',
  description: 'End a giveaway early and pick winners',
  permissions: ['Administrator'],
  cooldown: 10,
  async execute(interaction, client) {
    try {
      const messageId = interaction.options.getString('message-id');
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const giveaway = await Giveaway.findOne({ messageId, guildId: interaction.guild.id, ended: false });
      if (!giveaway) {
        return interaction.editReply({ content: 'Giveaway not found or already ended.' });
      }

      giveaway.ended = true;
      const validEntries = giveaway.entries.filter(e => e);
      let winners = [];
      if (validEntries.length > 0) {
        const shuffled = validEntries.sort(() => 0.5 - Math.random());
        winners = shuffled.slice(0, Math.min(giveaway.winners, shuffled.length));
      }

      const channel = client.channels.cache.get(giveaway.channelId);
      if (channel) {
        const winnerMentions = winners.map(id => `<@${id}>`).join(', ') || 'No valid entries';
        await channel.send({
          content: `🎉 **Giveaway Ended!**\nPrize: **${giveaway.prize}**\nWinner(s): ${winnerMentions}\nHosted by: <@${giveaway.hostedBy}>`,
        });
        try {
          const msg = await channel.messages.fetch(giveaway.messageId);
          await msg.edit({ components: [] });
        } catch {}
      }

      await giveaway.save();
      await interaction.editReply({ content: '✅ Giveaway ended.' });
    } catch (error) {
      console.error('giveaway-end error:', error);
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
      if (!messageId) return message.reply('Usage: giveaway-end <messageId>');

      const giveaway = await Giveaway.findOne({ messageId, guildId: message.guild.id, ended: false });
      if (!giveaway) return message.reply('Giveaway not found or already ended.');

      giveaway.ended = true;
      const validEntries = giveaway.entries.filter(e => e);
      let winners = [];
      if (validEntries.length > 0) {
        const shuffled = validEntries.sort(() => 0.5 - Math.random());
        winners = shuffled.slice(0, Math.min(giveaway.winners, shuffled.length));
      }

      const channel = client.channels.cache.get(giveaway.channelId);
      if (channel) {
        const winnerMentions = winners.map(id => `<@${id}>`).join(', ') || 'No valid entries';
        await channel.send({
          content: `🎉 **Giveaway Ended!**\nPrize: **${giveaway.prize}**\nWinner(s): ${winnerMentions}\nHosted by: <@${giveaway.hostedBy}>`,
        });
        try {
          const msg = await channel.messages.fetch(giveaway.messageId);
          await msg.edit({ components: [] });
        } catch {}
      }

      await giveaway.save();
      await message.reply('✅ Giveaway ended.');
    } catch (error) {
      console.error('giveaway-end prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
