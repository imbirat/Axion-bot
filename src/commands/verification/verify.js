const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  return { question: `What is ${num1} + ${num2}?`, answer: String(num1 + num2) };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Verification system')
    .addSubcommand(sub =>
      sub.setName('start')
        .setDescription('Manually trigger verification'))
    .addSubcommand(sub =>
      sub.setName('setup')
        .setDescription('Set up verification panel')
        .addChannelOption(opt =>
          opt.setName('channel').setDescription('Verification panel channel').setRequired(true))
        .addRoleOption(opt =>
          opt.setName('role').setDescription('Role to assign on verify').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('role')
        .setDescription('Change the verify role')
        .addRoleOption(opt =>
          opt.setName('role').setDescription('The role to assign').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('mode')
        .setDescription('Set verification mode')
        .addStringOption(opt =>
          opt.setName('mode').setDescription('Verification method').setRequired(true)
            .addChoices(
              { name: 'Button', value: 'button' },
              { name: 'Captcha', value: 'captcha' },
              { name: 'Reaction', value: 'reaction' })))
    .addSubcommand(sub =>
      sub.setName('message')
        .setDescription('Set the verification embed message')
        .addStringOption(opt =>
          opt.setName('text').setDescription('Verification message').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('log')
        .setDescription('Set the verification log channel')
        .addChannelOption(opt =>
          opt.setName('channel').setDescription('Log channel').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('check')
        .setDescription('Check if a user is verified')
        .addUserOption(opt =>
          opt.setName('user').setDescription('User to check').setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('all')
        .setDescription('Verify all current members'))
    .addSubcommand(sub =>
      sub.setName('reset')
        .setDescription('Reset verification settings'))
    .addSubcommand(sub =>
      sub.setName('unverify')
        .setDescription('Remove verify role from a user')
        .addUserOption(opt =>
          opt.setName('user').setDescription('User to unverify').setRequired(true))),
  category: 'Verification',
  usage: '/verify <start|setup|role|mode|message|log|check|all|reset|unverify>',
  description: 'Complete server verification system',
  permissions: [],
  cooldown: 3,
  prefixAliases: ['verifysetup', 'verifyrole', 'verifymode', 'verifymessage', 'verifylog', 'verifycheck', 'verifyall', 'verifyreset', 'unverify'],
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    try {
      const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });

      switch (sub) {
        case 'start': {
          if (!guildConfig || !guildConfig.verifyRole) {
            return interaction.reply({ content: 'Verification is not configured on this server.', ephemeral: true });
          }
          const member = await interaction.guild.members.fetch(interaction.user.id);
          if (member.roles.cache.has(guildConfig.verifyRole)) {
            return interaction.reply({ content: '✅ You are already verified!', ephemeral: true });
          }
          if (guildConfig.verifyMode === 'button') {
            await member.roles.add(guildConfig.verifyRole);
            await interaction.reply({ content: '✅ You have been verified!', ephemeral: true });
            if (guildConfig.verifyLogChannel) {
              const logChannel = interaction.guild.channels.cache.get(guildConfig.verifyLogChannel);
              if (logChannel) {
                const logEmbed = new EmbedBuilder()
                  .setColor(0x57F287).setTitle('User Verified')
                  .setDescription(`<@${interaction.user.id}> verified via /verify start`)
                  .setTimestamp();
                await logChannel.send({ embeds: [logEmbed] });
              }
            }
          } else if (guildConfig.verifyMode === 'captcha') {
            const captcha = generateCaptcha();
            if (!client.verifyCaptchas) client.verifyCaptchas = new Map();
            try {
              await interaction.user.send({
                content: `🔐 **Verification Captcha**\n\n${captcha.question}\n\nReply with the answer in this DM. This expires in 2 minutes.`
              });
            } catch (e) {
              return interaction.reply({ content: '❌ I cannot DM you. Please enable DMs to verify.', ephemeral: true });
            }
            client.verifyCaptchas.set(interaction.user.id, {
              answer: captcha.answer, guildId: interaction.guild.id, roleId: guildConfig.verifyRole,
              logChannelId: guildConfig.verifyLogChannel, expiresAt: Date.now() + 120000
            });
            setTimeout(() => { if (client.verifyCaptchas?.has(interaction.user.id)) client.verifyCaptchas.delete(interaction.user.id); }, 120000);
            await interaction.reply({ content: '✅ Captcha sent! Check your DMs.', ephemeral: true });
          } else {
            await interaction.reply({ content: 'Verification mode not supported via command.', ephemeral: true });
          }
          break;
        }
        case 'setup': {
          const channel = interaction.options.getChannel('channel');
          const role = interaction.options.getRole('role');
          const verifyBtn = new ButtonBuilder().setCustomId('verify_click').setLabel('Verify').setStyle(ButtonStyle.Success).setEmoji('✅');
          const row = new ActionRowBuilder().addComponents(verifyBtn);
          const embed = new EmbedBuilder()
            .setColor(0x5865F2).setTitle('Verification')
            .setDescription('Click the button below to verify yourself and gain access to the server.')
            .setTimestamp();
          await channel.send({ embeds: [embed], components: [row] });
          await GuildConfig.findOneAndUpdate(
            { guildId: interaction.guild.id },
            { $set: { verifyChannel: channel.id, verifyRole: role.id, verifyEnabled: true } },
            { upsert: true }
          );
          await interaction.reply({ content: '✅ Verification setup complete.', ephemeral: true });
          break;
        }
        case 'role': {
          const role = interaction.options.getRole('role');
          await GuildConfig.findOneAndUpdate(
            { guildId: interaction.guild.id },
            { $set: { verifyRole: role.id } }
          );
          await interaction.reply({ content: '✅ Verify role updated.', ephemeral: true });
          break;
        }
        case 'mode': {
          const mode = interaction.options.getString('mode');
          await GuildConfig.findOneAndUpdate(
            { guildId: interaction.guild.id },
            { $set: { verifyMode: mode } }
          );
          await interaction.reply({ content: `✅ Verify mode set to ${mode}.`, ephemeral: true });
          break;
        }
        case 'message': {
          const text = interaction.options.getString('text');
          await GuildConfig.findOneAndUpdate(
            { guildId: interaction.guild.id },
            { $set: { verifyMessage: text } }
          );
          await interaction.reply({ content: '✅ Verify message updated.', ephemeral: true });
          break;
        }
        case 'log': {
          const channel = interaction.options.getChannel('channel');
          await GuildConfig.findOneAndUpdate(
            { guildId: interaction.guild.id },
            { $set: { verifyLogChannel: channel.id } }
          );
          await interaction.reply({ content: '✅ Verify log channel set.', ephemeral: true });
          break;
        }
        case 'check': {
          const target = interaction.options.getUser('user') || interaction.user;
          if (!guildConfig || !guildConfig.verifyRole) {
            return interaction.reply({ content: 'Verification role not configured.', ephemeral: true });
          }
          const member = await interaction.guild.members.fetch(target.id);
          const verified = member.roles.cache.has(guildConfig.verifyRole);
          await interaction.reply({ content: verified ? `✅ ${target} is verified` : `❌ Not verified.`, ephemeral: true });
          break;
        }
        case 'all': {
          if (!guildConfig || !guildConfig.verifyRole) {
            return interaction.reply({ content: 'Verification role not configured.', ephemeral: true });
          }
          await interaction.deferReply();
          const members = await interaction.guild.members.fetch();
          const role = interaction.guild.roles.cache.get(guildConfig.verifyRole);
          if (!role) return interaction.editReply({ content: 'Verify role not found.' });
          let count = 0;
          for (const [, m] of members) {
            if (!m.roles.cache.has(role.id) && !m.user.bot) {
              await m.roles.add(role.id).catch(() => {});
              count++;
            }
          }
          await interaction.editReply({ content: `✅ Verified ${count} members.` });
          break;
        }
        case 'reset': {
          await GuildConfig.findOneAndUpdate(
            { guildId: interaction.guild.id },
            { $unset: { verifyChannel: '', verifyRole: '', verifyLogChannel: '', verifyMessage: '' }, $set: { verifyEnabled: false, verifyMode: 'button' } }
          );
          await interaction.reply({ content: '✅ Verification settings reset.', ephemeral: true });
          break;
        }
        case 'unverify': {
          const target = interaction.options.getUser('user');
          if (!guildConfig || !guildConfig.verifyRole) {
            return interaction.reply({ content: 'Verification role not configured.', ephemeral: true });
          }
          const member = await interaction.guild.members.fetch(target.id);
          await member.roles.remove(guildConfig.verifyRole);
          await interaction.reply({ content: `✅ Removed verify role from ${target}.`, ephemeral: true });
          break;
        }
      }
    } catch (error) {
      console.error(`verify ${sub} error:`, error);
      if (interaction.deferred) {
        await interaction.editReply({ content: 'There was an error executing this command.' });
      } else {
        await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
      }
    }
  },
  async prefixExecute(message, args, client) {
    const sub = args[0]?.toLowerCase();
    const rest = args.slice(1);
    try {
      const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });

      if (!sub || sub === 'start') {
        if (!guildConfig || !guildConfig.verifyRole) return message.reply('Verification not configured.');
        const member = await message.guild.members.fetch(message.author.id);
        if (member.roles.cache.has(guildConfig.verifyRole)) return message.reply('Already verified!');
        if (guildConfig.verifyMode === 'button') {
          await member.roles.add(guildConfig.verifyRole);
          await message.reply('✅ Verified!');
          if (guildConfig.verifyLogChannel) {
            const logChannel = message.guild.channels.cache.get(guildConfig.verifyLogChannel);
            if (logChannel) {
              const logEmbed = new EmbedBuilder()
                .setColor(0x57F287).setTitle('User Verified')
                .setDescription(`<@${message.author.id}> verified via prefix verify`)
                .setTimestamp();
              await logChannel.send({ embeds: [logEmbed] });
            }
          }
        } else if (guildConfig.verifyMode === 'captcha') {
          const captcha = generateCaptcha();
          if (!client.verifyCaptchas) client.verifyCaptchas = new Map();
          try {
            await message.author.send({ content: `🔐 **Verification Captcha**\n\n${captcha.question}\n\nReply with the answer in this DM. Expires in 2 minutes.` });
          } catch (e) { return message.reply('❌ Cannot DM you.'); }
          client.verifyCaptchas.set(message.author.id, {
            answer: captcha.answer, guildId: message.guild.id, roleId: guildConfig.verifyRole,
            logChannelId: guildConfig.verifyLogChannel, expiresAt: Date.now() + 120000
          });
          setTimeout(() => { if (client.verifyCaptchas?.has(message.author.id)) client.verifyCaptchas.delete(message.author.id); }, 120000);
          await message.reply('✅ Captcha sent! Check your DMs.');
        } else {
          await message.reply('Mode not supported via command.');
        }
        return;
      }

      switch (sub) {
        case 'setup': {
          const channel = message.mentions.channels.first();
          const role = message.mentions.roles.first();
          if (!channel || !role) return message.reply('Usage: verify setup <#channel> <@role>');
          const verifyBtn = new ButtonBuilder().setCustomId('verify_click').setLabel('Verify').setStyle(ButtonStyle.Success).setEmoji('✅');
          const row = new ActionRowBuilder().addComponents(verifyBtn);
          const embed = new EmbedBuilder()
            .setColor(0x5865F2).setTitle('Verification')
            .setDescription('Click the button below to verify yourself and gain access to the server.')
            .setTimestamp();
          await channel.send({ embeds: [embed], components: [row] });
          await GuildConfig.findOneAndUpdate(
            { guildId: message.guild.id },
            { $set: { verifyChannel: channel.id, verifyRole: role.id, verifyEnabled: true } },
            { upsert: true }
          );
          await message.reply('✅ Verification setup complete.');
          break;
        }
        case 'role': {
          const role = message.mentions.roles.first();
          if (!role) return message.reply('Usage: verify role <@role>');
          await GuildConfig.findOneAndUpdate({ guildId: message.guild.id }, { $set: { verifyRole: role.id } });
          await message.reply('✅ Verify role updated.');
          break;
        }
        case 'mode': {
          const mode = rest[0]?.toLowerCase();
          if (!mode || !['button', 'captcha', 'reaction'].includes(mode)) return message.reply('Usage: verify mode <button|captcha|reaction>');
          await GuildConfig.findOneAndUpdate({ guildId: message.guild.id }, { $set: { verifyMode: mode } });
          await message.reply(`✅ Verify mode set to ${mode}.`);
          break;
        }
        case 'message': {
          const text = rest.join(' ');
          if (!text) return message.reply('Usage: verify message <text>');
          await GuildConfig.findOneAndUpdate({ guildId: message.guild.id }, { $set: { verifyMessage: text } });
          await message.reply('✅ Verify message updated.');
          break;
        }
        case 'log': {
          const channel = message.mentions.channels.first();
          if (!channel) return message.reply('Usage: verify log <#channel>');
          await GuildConfig.findOneAndUpdate({ guildId: message.guild.id }, { $set: { verifyLogChannel: channel.id } });
          await message.reply('✅ Verify log channel set.');
          break;
        }
        case 'check': {
          const target = message.mentions.members.first() || message.member;
          if (!guildConfig || !guildConfig.verifyRole) return message.reply('Verification role not configured.');
          const verified = target.roles.cache.has(guildConfig.verifyRole);
          await message.reply(verified ? `✅ ${target.user} is verified` : `❌ Not verified.`);
          break;
        }
        case 'all': {
          if (!guildConfig || !guildConfig.verifyRole) return message.reply('Verification role not configured.');
          const members = await message.guild.members.fetch();
          const role = message.guild.roles.cache.get(guildConfig.verifyRole);
          if (!role) return message.reply('Verify role not found.');
          let count = 0;
          for (const [, m] of members) {
            if (!m.roles.cache.has(role.id) && !m.user.bot) {
              await m.roles.add(role.id).catch(() => {});
              count++;
            }
          }
          await message.reply(`✅ Verified ${count} members.`);
          break;
        }
        case 'reset': {
          await GuildConfig.findOneAndUpdate(
            { guildId: message.guild.id },
            { $unset: { verifyChannel: '', verifyRole: '', verifyLogChannel: '', verifyMessage: '' }, $set: { verifyEnabled: false, verifyMode: 'button' } }
          );
          await message.reply('✅ Verification settings reset.');
          break;
        }
        case 'unverify': {
          const target = message.mentions.members.first();
          if (!target) return message.reply('Usage: verify unverify <@user>');
          if (!guildConfig || !guildConfig.verifyRole) return message.reply('Verification role not configured.');
          await target.roles.remove(guildConfig.verifyRole);
          await message.reply(`✅ Removed verify role from ${target.user}.`);
          break;
        }
        default:
          await message.reply('Usage: verify <start|setup|role|mode|message|log|check|all|reset|unverify>');
      }
    } catch (error) {
      console.error(`verify prefix ${sub} error:`, error);
      await message.reply('There was an error executing this command.');
    }
  },
};
