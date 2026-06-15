const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifymessage')
    .setDescription('Customize the verification panel description text')
    .addStringOption(opt =>
      opt.setName('text').setDescription('New verification message').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  category: 'Verification',
  description: 'Customize the verification panel description text',
  permissions: ['Administrator'],
  cooldown: 5,
  async execute(interaction, client) {
    const text = interaction.options.getString('text');
    await GuildConfig.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { $set: { verifyMessage: text } },
      { upsert: true }
    );
    await interaction.reply({ content: '✅ Verification message updated.', flags: MessageFlags.Ephemeral });
  },
  async prefixExecute(message, args, client) {
    const text = args.join(' ');
    if (!text) return message.reply('Usage: verifymessage <text>');
    await GuildConfig.findOneAndUpdate(
      { guildId: message.guild.id },
      { $set: { verifyMessage: text } },
      { upsert: true }
    );
    await message.reply('✅ Verification message updated.');
  },
};
