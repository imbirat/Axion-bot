const { SlashCommandBuilder , MessageFlags} = require('discord.js');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reminder')
    .setDescription('Set a reminder')
    .addStringOption(option =>
      option.setName('time')
        .setDescription('Time until reminder (e.g. 10m, 1h, 1d)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Reminder message')
        .setRequired(true)
    ),
  category: 'Utilities',
  usage: '/reminder <time> <message>',
  description: 'Set a reminder and get DM\'d when the time is up',
  permissions: [],
  cooldown: 10,
  async execute(interaction, client) {
    try {
      const timeStr = interaction.options.getString('time');
      const message = interaction.options.getString('message');
      const duration = ms(timeStr);

      if (!duration) {
        return interaction.reply({ content: 'Invalid time format. Use e.g. `10m`, `1h`, `1d`.', flags: MessageFlags.Ephemeral });
      }

      if (duration < 10000) {
        return interaction.reply({ content: 'Time must be at least 10 seconds.', flags: MessageFlags.Ephemeral });
      }

      if (duration > 2592000000) {
        return interaction.reply({ content: 'Time cannot exceed 30 days.', flags: MessageFlags.Ephemeral });
      }

      await interaction.reply({ content: `✅ I'll remind you about "${message}" in ${timeStr}.` });

      setTimeout(async () => {
        try {
          await interaction.user.send(`⏰ **Reminder:** ${message}`);
        } catch {
          const channel = interaction.guild.channels.cache.get(interaction.channelId);
          if (channel) {
            await channel.send(`${interaction.user}, ⏰ **Reminder:** ${message}`).catch(() => {});
          }
        }
      }, duration);
    } catch (error) {
      console.error('reminder command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      if (args.length < 2) {
        return message.reply('Usage: .reminder <time> <message> (e.g. .reminder 10m Take a break)');
      }

      const timeStr = args[0];
      const reminderMsg = args.slice(1).join(' ');
      const duration = ms(timeStr);

      if (!duration) {
        return message.reply('Invalid time format. Use e.g. `10m`, `1h`, `1d`.');
      }

      if (duration < 10000) {
        return message.reply('Time must be at least 10 seconds.');
      }

      if (duration > 2592000000) {
        return message.reply('Time cannot exceed 30 days.');
      }

      await message.channel.send(`✅ I'll remind you about "${reminderMsg}" in ${timeStr}.`);

      setTimeout(async () => {
        try {
          await message.author.send(`⏰ **Reminder:** ${reminderMsg}`);
        } catch {
          await message.channel.send(`${message.author}, ⏰ **Reminder:** ${reminderMsg}`);
        }
      }, duration);
    } catch (error) {
      console.error('reminder prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
