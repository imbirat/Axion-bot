const { EmbedBuilder } = require('discord.js');
const Birthday = require('../models/Birthday');
const GuildConfig = require('../models/GuildConfig');

async function setBirthday(userId, guildId, date, year) {
  try {
    const birthday = await Birthday.findOneAndUpdate(
      { userId, guildId },
      { date, year },
      { upsert: true, new: true }
    );
    return birthday;
  } catch (error) {
    console.error('setBirthday error:', error);
    throw error;
  }
}

async function checkBirthday(userId, guildId) {
  try {
    return await Birthday.findOne({ userId, guildId });
  } catch (error) {
    console.error('checkBirthday error:', error);
    throw error;
  }
}

async function listBirthdays(guildId) {
  try {
    return await Birthday.find({ guildId }).lean();
  } catch (error) {
    console.error('listBirthdays error:', error);
    throw error;
  }
}

async function announceBirthdays(client) {
  try {
    const now = new Date();
    const today = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const birthdays = await Birthday.find({ date: today });

    for (const birthday of birthdays) {
      try {
        const guild = client.guilds.cache.get(birthday.guildId);
        if (!guild) continue;

        const guildConfig = await GuildConfig.findOne({ guildId: birthday.guildId });
        const channelId = guildConfig?.welcomeChannel;
        const channel = channelId
          ? guild.channels.cache.get(channelId)
          : guild.channels.cache.find(c => c.type === 0 && c.name === 'general');

        if (!channel) continue;

        const embed = new EmbedBuilder()
          .setColor(0xFEE75C)
          .setTitle('🎂 Happy Birthday!')
          .setDescription(`Happy birthday <@${birthday.userId}>! 🎉🎈`)
          .setThumbnail('https://cdn-icons-png.flaticon.com/512/3069/3069179.png')
          .setFooter({ text: 'Have a wonderful day!' });

        if (birthday.year) {
          const age = now.getFullYear() - birthday.year;
          embed.addFields({ name: 'Age', value: `${age} years old`, inline: true });
        }

        await channel.send({ content: `<@${birthday.userId}>`, embeds: [embed] });
      } catch (err) {
        console.error(`Birthday announcement error for ${birthday.userId}:`, err);
      }
    }
  } catch (error) {
    console.error('announceBirthdays error:', error);
  }
}

module.exports = { setBirthday, checkBirthday, listBirthdays, announceBirthdays };
