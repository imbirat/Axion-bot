const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } = require('discord.js');

module.exports = {
  customId: 'container_builder_trigger_',
  async execute(interaction, client) {
    const channelId = interaction.customId.replace('container_builder_trigger_', '');
    const channel = interaction.guild.channels.cache.get(channelId);
    if (!channel) {
      return interaction.reply({ content: '❌ Target channel not found.', flags: MessageFlags.Ephemeral });
    }
    const modal = new ModalBuilder()
      .setCustomId(`container_builder_${channel.id}`)
      .setTitle('Container Builder')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('content')
            .setLabel('Container content (use --- for dividers)')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Section 1 text...\n\n---\n\nSection 2 text...')
            .setRequired(true)
        )
      );
    await interaction.showModal(modal);
  },
};
