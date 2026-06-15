const { MessageFlags } = require('discord.js');
const Giveaway = require('../../models/Giveaway');

module.exports = {
  customId: 'giveaway_enter',
  async execute(interaction, client) {
    const giveaway = await Giveaway.findOne({ messageId: interaction.message.id, ended: false });
    if (!giveaway) {
      return interaction.reply({ content: 'This giveaway has ended or no longer exists.', flags: MessageFlags.Ephemeral });
    }
    if (giveaway.entries.includes(interaction.user.id)) {
      return interaction.reply({ content: 'Already entered!', flags: MessageFlags.Ephemeral });
    }
    if (giveaway.roleRequirement) {
      const member = await interaction.guild.members.fetch(interaction.user.id);
      if (!member.roles.cache.has(giveaway.roleRequirement)) {
        return interaction.reply({ content: 'You do not have the required role.', flags: MessageFlags.Ephemeral });
      }
    }
    if (giveaway.inviteRequirement) {
      const invites = client.inviteCache?.get(interaction.guild.id)?.get(interaction.user.id) || 0;
      if (invites < giveaway.inviteRequirement) {
        return interaction.reply({ content: `You need ${giveaway.inviteRequirement} invites to enter.`, flags: MessageFlags.Ephemeral });
      }
    }
    giveaway.entries.push(interaction.user.id);
    await giveaway.save();
    await interaction.reply({ content: 'You have entered the giveaway!', flags: MessageFlags.Ephemeral });
  },
};
