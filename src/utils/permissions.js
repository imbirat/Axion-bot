const { PermissionsBitField } = require('discord.js');

function hasPermission(member, perm) {
  if (!member || !perm) return false;
  if (member.permissions instanceof PermissionsBitField) {
    return member.permissions.has(perm);
  }
  return false;
}

module.exports = { hasPermission };
