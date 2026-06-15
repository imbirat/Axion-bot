const { Events, MessageFlags } = require('discord.js');
const { handleComponent } = require('../../handlers/componentHandler');
const { t } = require('../../utils/i18n');

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction, client) {
    try {
      // ── Slash commands ──────────────────────────────────
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        // Cooldown check
        const { cooldowns } = client;
        if (!cooldowns.has(command.data.name)) cooldowns.set(command.data.name, new Map());
        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const cooldownAmount = (command.cooldown ?? 3) * 1000;

        if (timestamps.has(interaction.user.id)) {
          const exp = timestamps.get(interaction.user.id) + cooldownAmount;
          if (now < exp) {
            const left = ((exp - now) / 1000).toFixed(1);
            return interaction.reply({ content: await t(interaction.guildId, 'errors.cooldown', { time: left }), flags: MessageFlags.Ephemeral });
          }
        }
        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        await command.execute(interaction, client);
        return;
      }

      // ── Components (buttons, select menus, modals) ──────
      if (interaction.isButton() || interaction.isStringSelectMenu() || interaction.isModalSubmit()) {
        await handleComponent(interaction, client);
      }

    } catch (err) {
      console.error('[INTERACTION] Error:', err);
      const msg = { content: 'An error occurred.', flags: MessageFlags.Ephemeral };
      if (interaction.replied || interaction.deferred) await interaction.followUp(msg).catch(() => {});
      else await interaction.reply(msg).catch(() => {});
    }
  },
};
