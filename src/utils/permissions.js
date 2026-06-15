const { PermissionFlagsBits } = require('discord.js');

function hasPermission(member, permission) {
  if (!member?.permissions) return false;
  return member.permissions.has(permission);
}

function isAdmin(member) {
  return hasPermission(member, PermissionFlagsBits.Administrator);
}

function isModerator(member) {
  return hasPermission(member, PermissionFlagsBits.ModerateMembers)
    || hasPermission(member, PermissionFlagsBits.BanMembers)
    || hasPermission(member, PermissionFlagsBits.KickMembers)
    || isAdmin(member);
}

function isOwner(member) {
  return member.id === member.guild.ownerId;
}

module.exports = { hasPermission, isAdmin, isModerator, isOwner };
