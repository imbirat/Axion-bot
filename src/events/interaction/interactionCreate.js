const { Events, EmbedBuilder } = require('discord.js');
const { handleComponent } = require('../../handlers/componentHandler');
const { hasPermission } = require('../../utils/permissions');
const logger = require('../../utils/logger');

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        return interaction.reply({ content: 'Command not found.', ephemeral: true });
      }

      if (command.permissions) {
        const missing = command.permissions.filter(p => !hasPermission(interaction.member, p));
        if (missing.length > 0) {
          return interaction.reply({
            content: `You need the following permissions: ${missing.join(', ')}`,
            ephemeral: true,
          });
        }
      }

      if (!client.cooldowns.has(command.data.name)) {
        client.cooldowns.set(command.data.name, new Map());
      }
      const timestamps = client.cooldowns.get(command.data.name);
      const cooldownAmount = (command.cooldown || 3) * 1000;
      const now = Date.now();

      if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
        if (now < expirationTime) {
          const timeLeft = Math.round((expirationTime - now) / 1000);
          return interaction.reply({
            content: `Please wait ${timeLeft}s before using this command again.`,
            ephemeral: true,
          });
        }
      }

      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

      try {
        await command.execute(interaction, client);
      } catch (error) {
        logger.error(`Error executing command ${interaction.commandName}:`, error);
        const reply = { content: 'There was an error executing this command.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply).catch(() => {});
        } else {
          await interaction.reply(reply).catch(() => {});
        }
      }
      return;
    }

    if (interaction.isButton() || interaction.isAnySelectMenu() || interaction.isModalSubmit()) {
      try {
        await handleComponent(interaction, client);
      } catch (error) {
        logger.error('Component handler error:', error);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'There was an error handling this interaction.', ephemeral: true }).catch(() => {});
        }
      }
      return;
    }

    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (command && command.autocomplete) {
        try {
          await command.autocomplete(interaction, client);
        } catch (error) {
          logger.error(`Error in autocomplete for ${interaction.commandName}:`, error);
        }
      }
    }
  },
};
