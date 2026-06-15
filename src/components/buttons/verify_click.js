const { EmbedBuilder, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  return { question: `What is ${num1} + ${num2}?`, answer: String(num1 + num2) };
}

module.exports = {
  customId: 'verify_click',
  async execute(interaction, client) {
    const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!guildConfig || !guildConfig.verifyRole) {
      return interaction.reply({ content: 'Verification is not configured.', flags: MessageFlags.Ephemeral });
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (member.roles.cache.has(guildConfig.verifyRole)) {
      return interaction.reply({ content: 'You are already verified!', flags: MessageFlags.Ephemeral });
    }

    if (guildConfig.verifyMode === 'button') {
      await member.roles.add(guildConfig.verifyRole);
      await interaction.reply({ content: 'You have been verified!', flags: MessageFlags.Ephemeral });
      if (guildConfig.verifyLogChannel) {
        const logChannel = interaction.guild.channels.cache.get(guildConfig.verifyLogChannel);
        if (logChannel) {
          const embed = new EmbedBuilder()
            .setColor(0x57F287).setTitle('User Verified')
            .setDescription(`<@${interaction.user.id}> verified via button`)
            .setTimestamp();
          await logChannel.send({ embeds: [embed] });
        }
      }
      return;
    }

    if (guildConfig.verifyMode === 'captcha') {
      const captcha = generateCaptcha();
      let dmChannel;
      try {
        dmChannel = await interaction.user.createDM();
        await dmChannel.send(`**Verification Captcha**\n\n${captcha.question}\n\nReply within 5 minutes. You have 3 attempts.`);
      } catch {
        return interaction.reply({ content: 'I cannot DM you. Enable DMs to verify.', flags: MessageFlags.Ephemeral });
      }
      await interaction.reply({ content: 'Captcha sent! Check your DMs.', flags: MessageFlags.Ephemeral });

      let attempts = 0;
      const filter = m => m.author.id === interaction.user.id;
      const collector = dmChannel.createMessageCollector({ filter, time: 300000, max: 3 });
      collector.on('collect', async msg => {
        attempts++;
        if (msg.content === captcha.answer) {
          await member.roles.add(guildConfig.verifyRole);
          await msg.reply('Correct! You are now verified.');
          collector.stop();
          if (guildConfig.verifyLogChannel) {
            const logChannel = interaction.guild.channels.cache.get(guildConfig.verifyLogChannel);
            if (logChannel) {
              const embed = new EmbedBuilder()
                .setColor(0x57F287).setTitle('User Verified')
                .setDescription(`<@${interaction.user.id}> verified via captcha`)
                .setTimestamp();
              await logChannel.send({ embeds: [embed] });
            }
          }
        } else if (attempts >= 3) {
          await msg.reply('All attempts used. Verification failed. Run /verify again.');
        } else {
          await msg.reply(`Wrong answer. ${3 - attempts} attempt(s) remaining.`);
        }
      });
      collector.on('end', async (_, reason) => {
        if (reason === 'time') {
          await interaction.user.send('Verification timed out. Run /verify again.').catch(() => {});
        }
      });
      return;
    }

    if (guildConfig.verifyMode === 'reaction') {
      await interaction.reply({ content: 'Check the channel for the verification message.', flags: MessageFlags.Ephemeral });
      const msg = await interaction.channel.send('React with ✅ to verify.');
      await msg.react('✅');
      const filter = (reaction, user) => reaction.emoji.name === '✅' && user.id === interaction.user.id;
      const collector = msg.createReactionCollector({ filter, time: 60000, max: 1 });
      collector.on('collect', async () => {
        await member.roles.add(guildConfig.verifyRole);
        await interaction.followUp({ content: 'You have been verified!', flags: MessageFlags.Ephemeral });
        if (guildConfig.verifyLogChannel) {
          const logChannel = interaction.guild.channels.cache.get(guildConfig.verifyLogChannel);
          if (logChannel) {
            const embed = new EmbedBuilder()
              .setColor(0x57F287).setTitle('User Verified')
              .setDescription(`<@${interaction.user.id}> verified via reaction`)
              .setTimestamp();
            await logChannel.send({ embeds: [embed] });
          }
        }
      });
      collector.on('end', async (_, reason) => {
        if (reason === 'time') {
          await interaction.followUp({ content: 'Verification timed out.', flags: MessageFlags.Ephemeral });
        }
      });
      return;
    }

    await interaction.reply({ content: 'Verification mode not supported.', flags: MessageFlags.Ephemeral });
  },
};
