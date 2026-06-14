const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  customId: 'custommessage_modal',
  async execute(interaction, client) {
    try {
      const type = interaction.fields.getTextInputValue('type');
      const message = interaction.fields.getTextInputValue('message');
      const embedSetting = interaction.fields.getTextInputValue('embed');

      const typeFieldMap = {
        welcome: 'welcomeMessage',
        farewell: 'farewellMessage',
        booster: 'boosterMessage'
      };
      const embedFieldMap = {
        welcome: 'welcomeEmbed',
        farewell: 'farewellEmbed',
        booster: 'boosterEmbed'
      };

      const messageField = typeFieldMap[type];
      const embedField = embedFieldMap[type];

      if (!messageField) {
        return interaction.reply({ content: 'Invalid message type.', flags: MessageFlags.Ephemeral });
      }

      const update = { [messageField]: message };
      if (embedSetting) {
        update[embedField] = embedSetting === 'true';
      }

      await GuildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { $set: update },
        { upsert: true }
      );

      const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
      await interaction.reply({
        content: `✅ ${typeLabel} message has been updated.`,
        flags: MessageFlags.Ephemeral
      });
    } catch (error) {
      console.error('custommessage_modal error:', error);
      await interaction.reply({ content: '❌ Failed to save message.', flags: MessageFlags.Ephemeral });
    }
  }
};
