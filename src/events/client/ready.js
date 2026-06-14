const { Events, ActivityType } = require('discord.js');
const { loadComponents } = require('../../handlers/componentHandler');
const logger = require('../../utils/logger');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    client.user.setActivity('/help | Axion', { type: ActivityType.Playing });
    logger.success(`Ready! Logged in as ${client.user.tag}`);

    loadComponents();

    try {
      const schedulerService = require('../../services/schedulerService');
      await schedulerService.loadScheduledMessages(client);
    } catch (err) {
      logger.warn('Scheduler service not available');
    }

    try {
      const giveawayService = require('../../services/giveawayService');
      giveawayService.startCron(client);
    } catch (err) {
      logger.warn('Giveaway service not available');
    }

    try {
      const birthdayService = require('../../services/birthdayService');
      birthdayService.startCron(client);
    } catch (err) {
      logger.warn('Birthday service not available');
    }

    try {
      const bumpService = require('../../services/bumpService');
      bumpService.startCron(client);
    } catch (err) {
      logger.warn('Bump service not available');
    }

    try {
      const statsChannelService = require('../../services/statsChannelService');
      statsChannelService.startCron(client);
    } catch (err) {
      logger.warn('Stats channel service not available');
    }

    try {
      const notificationService = require('../../services/notificationService');
      notificationService.startCron(client);
    } catch (err) {
      logger.warn('Notification service not available');
    }
  },
};
