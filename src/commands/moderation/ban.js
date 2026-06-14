const { SlashCommandBuilder, PermissionsBitField , MessageFlags} = require('discord.js');
const { t } = require('../../utils/i18n');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to ban')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the ban')
        .setRequired(false)
    ),
  category: 'Moderation',
  usage: '/ban <user> [reason]',
  description: 'Ban a user from the server',
  permissions: ['BanMembers'],
  cooldown: 5,
  async execute(interaction, client) {
    try {
      const targetUser = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const member = interaction.guild.members.cache.get(targetUser.id);

      if (!member) {
        return interaction.reply({ content: await t(interaction.guild.id, 'moderation.user_not_found', { defaultValue: 'Could not find that user in this server.' }), flags: MessageFlags.Ephemeral });
      }

      if (!member.bannable) {
        return interaction.reply({ content: await t(interaction.guild.id, 'moderation.cannot_ban', { defaultValue: 'I cannot ban that user.' }), flags: MessageFlags.Ephemeral });
      }

      if (member.roles.highest.position >= interaction.member.roles.highest.position) {
        return interaction.reply({ content: await t(interaction.guild.id, 'moderation.higher_role', { defaultValue: 'You cannot ban a user with a higher or equal role.' }), flags: MessageFlags.Ephemeral });
      }

      await member.ban({ reason });

      const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (config && config.loggingEnabled && config.loggingChannel) {
        const logChannel = interaction.guild.channels.cache.get(config.loggingChannel);
        if (logChannel) {
          await logChannel.send(`🚨 **Ban** | ${targetUser.tag} (${targetUser.id})\n**Moderator:** ${interaction.user.tag}\n**Reason:** ${reason}`).catch(() => {});
        }
      }

      const reply = await t(interaction.guild.id, 'moderation.ban.success', {
        defaultValue: '✅ **{{user}}** has been banned. Reason: {{reason}}',
        user: targetUser.tag,
        reason
      });
      await interaction.reply({ content: reply });
    } catch (error) {
      console.error('ban command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const targetUser = message.mentions.users.first();
      if (!targetUser) return message.reply('Please mention a valid user to ban.');

      const reason = args.slice(1).join(' ') || 'No reason provided';
      const member = message.guild.members.cache.get(targetUser.id);

      if (!member) return message.reply('Could not find that user in this server.');
      if (!member.bannable) return message.reply('I cannot ban that user.');
      if (member.roles.highest.position >= message.member.roles.highest.position) {
        return message.reply('You cannot ban a user with a higher or equal role.');
      }

      await member.ban({ reason });

      const config = await GuildConfig.findOne({ guildId: message.guild.id });
      if (config && config.loggingEnabled && config.loggingChannel) {
        const logChannel = message.guild.channels.cache.get(config.loggingChannel);
        if (logChannel) {
          await logChannel.send(`🚨 **Ban** | ${targetUser.tag} (${targetUser.id})\n**Moderator:** ${message.author.tag}\n**Reason:** ${reason}`).catch(() => {});
        }
      }

      await message.channel.send(`✅ **${targetUser.tag}** has been banned. Reason: ${reason}`);
    } catch (error) {
      console.error('ban prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
