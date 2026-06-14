const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits , MessageFlags} = require('discord.js');
const CountingChannel = require('../../models/CountingChannel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('counting')
    .setDescription('Manage counting system')
    .addSubcommand(sub =>
      sub.setName('setup')
        .setDescription('Set the counting channel')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('Channel for counting')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('reset')
        .setDescription('Reset the count to 0'))
    .addSubcommand(sub =>
      sub.setName('stats')
        .setDescription('Show counting stats'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Counting',
  usage: '/counting setup <#channel> | /counting reset | /counting stats',
  description: 'Set up, reset, or view counting game stats',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const sub = interaction.options.getSubcommand();

      if (sub === 'setup') {
        const channel = interaction.options.getChannel('channel');

        await CountingChannel.findOneAndUpdate(
          { guildId: interaction.guild.id },
          { $set: { channelId: channel.id, enabled: true, currentCount: 0, record: 0 } },
          { upsert: true }
        );

        await interaction.reply({ content: `✅ Counting channel set to ${channel}. Start counting from 1!`, flags: MessageFlags.Ephemeral });
        return;
      }

      if (sub === 'reset') {
        await CountingChannel.findOneAndUpdate(
          { guildId: interaction.guild.id },
          { $set: { currentCount: 0 } }
        );

        await interaction.reply({ content: '✅ Count reset to 0.', flags: MessageFlags.Ephemeral });
        return;
      }

      if (sub === 'stats') {
        const data = await CountingChannel.findOne({ guildId: interaction.guild.id });
        if (!data) {
          return interaction.reply({ content: 'Counting is not set up yet.', flags: MessageFlags.Ephemeral });
        }

        let lastUser = 'None';
        if (data.lastBrokeBy) {
          try {
            const u = await client.users.fetch(data.lastBrokeBy);
            lastUser = u.tag;
          } catch { lastUser = 'Unknown User'; }
        }

        const embed = new EmbedBuilder()
          .setColor(0x57F287)
          .setTitle('Counting Stats')
          .addFields(
            { name: 'Current Count', value: `${data.currentCount || 0}`, inline: true },
            { name: 'Record', value: `${data.record || 0}`, inline: true },
            { name: 'Last Broke By', value: lastUser, inline: true }
          );

        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('counting error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const sub = args[0];

      if (sub === 'setup') {
        const channel = message.mentions.channels.first();
        if (!channel) return message.reply('Usage: counting setup <#channel>');

        await CountingChannel.findOneAndUpdate(
          { guildId: message.guild.id },
          { $set: { channelId: channel.id, enabled: true, currentCount: 0, record: 0 } },
          { upsert: true }
        );

        await message.reply(`✅ Counting channel set to ${channel}. Start counting from 1!`);
        return;
      }

      if (sub === 'reset') {
        await CountingChannel.findOneAndUpdate(
          { guildId: message.guild.id },
          { $set: { currentCount: 0 } }
        );

        await message.reply('✅ Count reset to 0.');
        return;
      }

      if (sub === 'stats') {
        const data = await CountingChannel.findOne({ guildId: message.guild.id });
        if (!data) return message.reply('Counting is not set up yet.');

        let lastUser = 'None';
        if (data.lastBrokeBy) {
          try {
            const u = await client.users.fetch(data.lastBrokeBy);
            lastUser = u.tag;
          } catch { lastUser = 'Unknown User'; }
        }

        const embed = new EmbedBuilder()
          .setColor(0x57F287)
          .setTitle('Counting Stats')
          .addFields(
            { name: 'Current Count', value: `${data.currentCount || 0}`, inline: true },
            { name: 'Record', value: `${data.record || 0}`, inline: true },
            { name: 'Last Broke By', value: lastUser, inline: true }
          );

        await message.reply({ embeds: [embed] });
        return;
      }

      await message.reply('Usage: counting setup <#channel> | counting reset | counting stats');
    } catch (error) {
      console.error('counting prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  }
};
