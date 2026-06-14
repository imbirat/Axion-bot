const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  return { question: `What is ${num1} + ${num2}?`, answer: String(num1 + num2) };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Manually trigger verification'),
  category: 'Verification',
  usage: '/verify',
  description: 'Manually start the verification process',
  permissions: [],
  cooldown: 10,
  async execute(interaction, client) {
    try {
      const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
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
              .setColor(0x57F287)
              .setTitle('User Verified')
              .setDescription(`<@${interaction.user.id}> verified via /verify`)
              .setTimestamp();
            await logChannel.send({ embeds: [logEmbed] });
          }
        }
        return;
      }

      if (guildConfig.verifyMode === 'captcha') {
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
          answer: captcha.answer,
          guildId: interaction.guild.id,
          roleId: guildConfig.verifyRole,
          logChannelId: guildConfig.verifyLogChannel,
          expiresAt: Date.now() + 120000
        });

        setTimeout(() => {
          if (client.verifyCaptchas?.has(interaction.user.id)) {
            client.verifyCaptchas.delete(interaction.user.id);
          }
        }, 120000);

        await interaction.reply({ content: '✅ Captcha sent! Check your DMs.', ephemeral: true });
        return;
      }

      await interaction.reply({ content: 'Verification mode not supported via command.', ephemeral: true });
    } catch (error) {
      console.error('verify command error:', error);
      await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
  },
  async prefixExecute(message, args, client) {
    try {
      const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
      if (!guildConfig || !guildConfig.verifyRole) {
        return message.reply('Verification is not configured on this server.');
      }

      const member = await message.guild.members.fetch(message.author.id);
      if (member.roles.cache.has(guildConfig.verifyRole)) {
        return message.reply('✅ You are already verified!');
      }

      if (guildConfig.verifyMode === 'button') {
        await member.roles.add(guildConfig.verifyRole);
        await message.reply('✅ You have been verified!');

        if (guildConfig.verifyLogChannel) {
          const logChannel = message.guild.channels.cache.get(guildConfig.verifyLogChannel);
          if (logChannel) {
            const logEmbed = new EmbedBuilder()
              .setColor(0x57F287)
              .setTitle('User Verified')
              .setDescription(`<@${message.author.id}> verified via prefix verify`)
              .setTimestamp();
            await logChannel.send({ embeds: [logEmbed] });
          }
        }
        return;
      }

      if (guildConfig.verifyMode === 'captcha') {
        const captcha = generateCaptcha();
        if (!client.verifyCaptchas) client.verifyCaptchas = new Map();

        try {
          await message.author.send({
            content: `🔐 **Verification Captcha**\n\n${captcha.question}\n\nReply with the answer in this DM. This expires in 2 minutes.`
          });
        } catch (e) {
          return message.reply('❌ I cannot DM you. Please enable DMs to verify.');
        }

        client.verifyCaptchas.set(message.author.id, {
          answer: captcha.answer,
          guildId: message.guild.id,
          roleId: guildConfig.verifyRole,
          logChannelId: guildConfig.verifyLogChannel,
          expiresAt: Date.now() + 120000
        });

        setTimeout(() => {
          if (client.verifyCaptchas?.has(message.author.id)) {
            client.verifyCaptchas.delete(message.author.id);
          }
        }, 120000);

        await message.reply('✅ Captcha sent! Check your DMs.');
        return;
      }

      await message.reply('Verification mode not supported via command.');
    } catch (error) {
      console.error('verify prefix error:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
