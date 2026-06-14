const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle , MessageFlags} = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  return { question: `What is ${num1} + ${num2}?`, answer: String(num1 + num2) };
}

module.exports = {
  customId: 'verify_click',
  async execute(interaction, client) {
    try {
      const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (!guildConfig || !guildConfig.verifyRole) {
        return interaction.reply({ content: 'Verification is not configured on this server.', flags: MessageFlags.Ephemeral });
      }

      const member = await interaction.guild.members.fetch(interaction.user.id);
      if (member.roles.cache.has(guildConfig.verifyRole)) {
        return interaction.reply({ content: '✅ You are already verified!', flags: MessageFlags.Ephemeral });
      }

      if (guildConfig.verifyMode === 'button') {
        await member.roles.add(guildConfig.verifyRole);
        await interaction.reply({ content: '✅ You have been verified!', flags: MessageFlags.Ephemeral });

        if (guildConfig.verifyLogChannel) {
          const logChannel = interaction.guild.channels.cache.get(guildConfig.verifyLogChannel);
          if (logChannel) {
            const logEmbed = new EmbedBuilder()
              .setColor(0x57F287)
              .setTitle('User Verified')
              .setDescription(`<@${interaction.user.id}> verified via button`)
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
          return interaction.reply({ content: '❌ I cannot DM you. Please enable DMs to verify.', flags: MessageFlags.Ephemeral });
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

        await interaction.reply({ content: '✅ Captcha sent! Check your DMs.', flags: MessageFlags.Ephemeral });
        return;
      }

      await interaction.reply({ content: 'Verification mode not supported.', flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('verify_click error:', error);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ Verification failed.', flags: MessageFlags.Ephemeral });
      }
    }
  }
};
