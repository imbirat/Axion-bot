const Giveaway = require('../../models/Giveaway');

module.exports = {
  customId: 'giveaway_enter',
  async execute(interaction, client) {
    try {
      const giveaway = await Giveaway.findOne({ messageId: interaction.message.id, ended: false });
      if (!giveaway) {
        return interaction.reply({ content: '❌ This giveaway has ended or no longer exists.', flags: MessageFlags.Ephemeral });
      }

      if (giveaway.entries.includes(interaction.user.id)) {
        return interaction.reply({ content: '❌ You are already entered in this giveaway!', flags: MessageFlags.Ephemeral });
      }

      if (giveaway.roleRequirement) {
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (!member.roles.cache.has(giveaway.roleRequirement)) {
          return interaction.reply({ content: '❌ You do not have the required role to enter this giveaway.', flags: MessageFlags.Ephemeral });
        }
      }

      if (giveaway.inviteRequirement) {
        const invites = client.inviteCache?.get(interaction.guild.id)?.get(interaction.user.id) || 0;
        if (invites < giveaway.inviteRequirement) {
          return interaction.reply({ content: `❌ You need at least ${giveaway.inviteRequirement} invites to enter this giveaway.`, flags: MessageFlags.Ephemeral });
        }
      }

      giveaway.entries.push(interaction.user.id);
      await giveaway.save();

      await interaction.reply({ content: '✅ You have entered the giveaway!', flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('giveaway_enter error:', error);
      await interaction.reply({ content: '❌ Failed to enter giveaway.', flags: MessageFlags.Ephemeral });
    }
  }
};
