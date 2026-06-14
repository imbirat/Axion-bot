const { Events } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const UserProfile = require('../../models/UserProfile');
const ReactionRole = require('../../models/ReactionRole');
const StickyMessage = require('../../models/StickyMessage');
const CountingChannel = require('../../models/CountingChannel');
const CustomCommand = require('../../models/CustomCommand');
const Giveaway = require('../../models/Giveaway');
const Birthday = require('../../models/Birthday');
const TempVC = require('../../models/TempVC');
const BumpReminder = require('../../models/BumpReminder');
const Starboard = require('../../models/Starboard');
const logger = require('../../utils/logger');

module.exports = {
  name: Events.GuildDelete,
  once: false,
  async execute(guild) {
    const guildId = guild.id;

    try {
      await GuildConfig.deleteOne({ guildId });
      await UserProfile.deleteMany({ guildId });
      await ReactionRole.deleteMany({ guildId });
      await StickyMessage.deleteMany({ guildId });
      await CountingChannel.deleteMany({ guildId });
      await CustomCommand.deleteMany({ guildId });
      await Giveaway.deleteMany({ guildId });
      await Birthday.deleteMany({ guildId });
      await TempVC.deleteMany({ guildId });
      await BumpReminder.deleteMany({ guildId });
      await Starboard.deleteMany({ guildId });

      logger.info(`Left guild: ${guild.name} (${guildId}) — cleaned up all data`);
    } catch (err) {
      logger.error(`Error cleaning up data for guild ${guildId}:`, err);
    }
  },
};
