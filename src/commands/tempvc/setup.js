const { SlashCommandBuilder, PermissionFlagsBits , MessageFlags} = require('discord.js');
const TempVC = require('../../models/TempVC');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tempvc')
    .setDescription('Manage temporary voice channels')
    .addSubcommand(sub =>
      sub.setName('setup')
        .setDescription('Set up the temporary VC join channel')
        .addChannelOption(opt =>
          opt.setName('voice-channel')
            .setDescription('The voice channel to join to create a VC')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('config')
        .setDescription('Configure temp VC name template or user limit')
        .addStringOption(opt =>
          opt.setName('name')
            .setDescription('Name template. Use {user} and {count} variables')
            .setRequired(false))
        .addIntegerOption(opt =>
          opt.setName('limit')
            .setDescription('User limit for created VCs (0 for unlimited)')
            .setRequired(false)
            .setMinValue(0)))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Temp VC',
  usage: '/tempvc setup <#voice-channel> | /tempvc [name] [limit]',
  description: 'Set up and configure temporary voice channels',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const sub = interaction.options.getSubcommand();

      if (sub === 'setup') {
        const channel = interaction.options.getChannel('voice-channel');
        if (channel.type !== 2) {
          return interaction.reply({ content: 'Please select a voice channel.', flags: MessageFlags.Ephemeral });
        }

        await TempVC.findOneAndUpdate(
          { guildId: interaction.guild.id },
          { $set: { joinChannelId: channel.id } },
          { upsert: true }
        );

        await interaction.reply({ content: `✅ Temp VC setup complete! Members can now join ${channel} to create their own VC.`, flags: MessageFlags.Ephemeral });
        return;
      }

      if (sub === 'config') {
        const name = interaction.options.getString('name');
        const limit = interaction.options.getInteger('limit');

        const update = {};
        if (name) update.nameTemplate = name;
        if (limit !== null) update.userLimit = limit;

        if (Object.keys(update).length === 0) {
          return interaction.reply({ content: 'Please provide at least one option to update.', flags: MessageFlags.Ephemeral });
        }

        await TempVC.findOneAndUpdate(
          { guildId: interaction.guild.id },
          { $set: update },
          { upsert: true }
        );

        await interaction.reply({ content: '✅ Temp VC config updated.', flags: MessageFlags.Ephemeral });
      }
    } catch (error) {
      console.error('tempvc error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const sub = args[0];

      if (sub === 'setup') {
        const channel = message.mentions.channels.first();
        if (!channel || channel.type !== 2) {
          return message.reply('Usage: tempvc setup <#voice-channel>');
        }

        await TempVC.findOneAndUpdate(
          { guildId: message.guild.id },
          { $set: { joinChannelId: channel.id } },
          { upsert: true }
        );

        await message.reply(`✅ Temp VC setup complete! Members can now join ${channel} to create their own VC.`);
        return;
      }

      if (sub === 'config') {
        const name = args.find(a => a.startsWith('name:'));
        const limit = args.find(a => a.startsWith('limit:'));

        const update = {};
        if (name) update.nameTemplate = name.replace('name:', '');
        if (limit) update.userLimit = parseInt(limit.replace('limit:', ''), 10);

        if (Object.keys(update).length === 0) {
          return message.reply('Usage: tempvc config name:<template> limit:<number>');
        }

        await TempVC.findOneAndUpdate(
          { guildId: message.guild.id },
          { $set: update },
          { upsert: true }
        );

        await message.reply('✅ Temp VC config updated.');
        return;
      }

      await message.reply('Usage: tempvc setup <#voice-channel> | tempvc config name:<template> limit:<number>');
    } catch (error) {
      console.error('tempvc prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  }
};
