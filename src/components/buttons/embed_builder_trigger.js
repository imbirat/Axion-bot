const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } = require('discord.js');

module.exports = {
  customId: 'embed_builder_trigger_',
  async execute(interaction, client) {
    const channelId = interaction.customId.replace('embed_builder_trigger_', '');
    const channel = interaction.guild.channels.cache.get(channelId);
    if (!channel) {
      return interaction.reply({ content: '❌ Target channel not found.', flags: MessageFlags.Ephemeral });
    }
    const modal = new ModalBuilder()
      .setCustomId(`embed_builder_${channel.id}`)
      .setTitle('Embed Builder')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('content')
            .setLabel('Embed content (use Shift+Enter for newlines)')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('title: My Title\ndescription: Hello\ncolor: #FF0000\nfield: Name|Value|inline')
            .setRequired(true)
        )
      );
    await interaction.showModal(modal);
  },
};
