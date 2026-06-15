const { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags } = require('discord.js');

module.exports = {
  customId: 'container_builder_',
  async execute(interaction, client) {
    const channelId = interaction.customId.replace('container_builder_', '');
    const channel = interaction.guild.channels.cache.get(channelId);
    if (!channel) {
      return interaction.reply({ content: '❌ Target channel not found.', flags: MessageFlags.Ephemeral });
    }

    const content = interaction.fields.getTextInputValue('content');
    if (!content.trim()) {
      return interaction.reply({ content: '❌ Content cannot be empty.', flags: MessageFlags.Ephemeral });
    }

    try {
      const container = parseContainer(content);
      await channel.send({ flags: MessageFlags.IsComponentsV2, components: [container] });
      await interaction.reply({ content: `✅ Container sent to ${channel}.`, flags: MessageFlags.Ephemeral });
    } catch (err) {
      await interaction.reply({ content: `❌ ${err.message}`, flags: MessageFlags.Ephemeral });
    }
  },
};

function parseContainer(text) {
  const C = new ContainerBuilder();
  const sections = text.split('\n---\n').map(s => s.trim()).filter(Boolean);

  for (let i = 0; i < sections.length; i++) {
    C.addTextDisplayComponents(new TextDisplayBuilder().setContent(sections[i]));
    if (i < sections.length - 1) {
      C.addSeparatorComponents(new SeparatorBuilder().setDivider(true));
    }
  }

  return C;
}
