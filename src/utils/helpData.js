const helpCategories = [
  {
    name: 'Moderation', emoji: '⚔️', description: 'Keep your server safe and well-managed',
    commands: [
      { name: 'ban', usage: '/ban <user> [reason]', description: 'Ban a member from the server', perms: 'Ban Members', cooldown: '5s' },
      { name: 'kick', usage: '/kick <user> [reason]', description: 'Kick a member from the server', perms: 'Kick Members', cooldown: '5s' },
      { name: 'warn', usage: '/warn <user> <reason>', description: 'Warn a member (stored in DB)', perms: 'Moderate Members', cooldown: '3s' },
      { name: 'mute', usage: '/mute <user> [time] [reason]', description: 'Mute a member', perms: 'Moderate Members', cooldown: '5s' },
      { name: 'unmute', usage: '/unmute <user>', description: 'Unmute a member', perms: 'Moderate Members', cooldown: '3s' },
      { name: 'lock', usage: '/lock [channel]', description: 'Lock a channel', perms: 'Manage Channels', cooldown: '3s' },
      { name: 'unlock', usage: '/unlock [channel]', description: 'Unlock a channel', perms: 'Manage Channels', cooldown: '3s' },
      { name: 'jail', usage: '/jail <user> [reason]', description: 'Jail a member', perms: 'Administrator', cooldown: '5s' },
      { name: 'unjail', usage: '/unjail <user>', description: 'Release a jailed member', perms: 'Administrator', cooldown: '3s' },
      { name: 'nickname', usage: '/nickname <user> <name>', description: "Change a member's nickname", perms: 'Manage Nicknames', cooldown: '3s' },
      { name: 'slowmode', usage: '/slowmode <seconds>', description: 'Set channel slowmode', perms: 'Manage Channels', cooldown: '3s' },
      { name: 'clear', usage: '/clear <amount> [user]', description: 'Bulk delete messages', perms: 'Administrator', cooldown: '5s' },
    ],
  },
  {
    name: 'Anti-Nuke', emoji: '🛡️', description: 'Protect your server from raids and nukes',
    commands: [
      { name: 'antinuke enable', usage: '/antinuke enable', description: 'Enable anti-nuke protection', perms: 'Administrator', cooldown: '3s' },
      { name: 'antinuke disable', usage: '/antinuke disable', description: 'Disable anti-nuke protection', perms: 'Administrator', cooldown: '3s' },
      { name: 'antinuke config', usage: '/antinuke config', description: 'View anti-nuke settings', perms: 'Administrator', cooldown: '3s' },
    ],
  },
  {
    name: 'Logging', emoji: '📋', description: 'Track events and changes in your server',
    commands: [
      { name: 'logging enable', usage: '/logging enable', description: 'Enable server logging', perms: 'Administrator', cooldown: '3s' },
      { name: 'logging disable', usage: '/logging disable', description: 'Disable server logging', perms: 'Administrator', cooldown: '3s' },
    ],
  },
  {
    name: 'Auto-Mod', emoji: '🤖', description: 'Automatically moderate messages and behaviour',
    commands: [
      { name: 'automod enable', usage: '/automod enable', description: 'Enable auto-moderation', perms: 'Administrator', cooldown: '3s' },
      { name: 'automod disable', usage: '/automod disable', description: 'Disable auto-moderation', perms: 'Administrator', cooldown: '3s' },
      { name: 'automod config', usage: '/automod config', description: 'View auto-mod settings', perms: 'Administrator', cooldown: '3s' },
    ],
  },
  {
    name: 'Welcome / Farewell', emoji: '👋', description: 'Greet new members and farewell those who leave',
    commands: [
      { name: 'setchannel welcome', usage: '/setchannel welcome <#channel>', description: 'Set welcome channel', perms: 'Administrator', cooldown: '3s' },
      { name: 'setchannel farewell', usage: '/setchannel farewell <#channel>', description: 'Set farewell channel', perms: 'Administrator', cooldown: '3s' },
      { name: 'setcustommessage', usage: '/setcustommessage <type>', description: 'Set custom message', perms: 'Administrator', cooldown: '3s' },
    ],
  },
  {
    name: 'Leveling', emoji: '⭐', description: 'XP system — earn levels through activity',
    commands: [
      { name: 'profile xp', usage: '/profile xp', description: 'Show XP profile card', perms: 'Everyone', cooldown: '3s' },
      { name: 'leaderboard xp', usage: '/leaderboard xp', description: 'XP leaderboard', perms: 'Everyone', cooldown: '5s' },
      { name: 'addxp', usage: '/addxp <user> <amount>', description: 'Add XP to a user', perms: 'Administrator', cooldown: '3s' },
      { name: 'removexp', usage: '/removexp <user> <amount>', description: 'Remove XP from a user', perms: 'Administrator', cooldown: '3s' },
    ],
  },
  {
    name: 'Economy', emoji: '💰', description: 'Coins, banking, gambling and more',
    commands: [
      { name: 'profile economy', usage: '/profile economy', description: 'Show economy profile', perms: 'Everyone', cooldown: '3s' },
      { name: 'leaderboard economy', usage: '/leaderboard economy', description: 'Economy leaderboard', perms: 'Everyone', cooldown: '5s' },
      { name: 'daily', usage: '/daily', description: 'Claim daily reward', perms: 'Everyone', cooldown: '86400s' },
      { name: 'work', usage: '/work', description: 'Work for coins', perms: 'Everyone', cooldown: '3600s' },
      { name: 'fish', usage: '/fish', description: 'Go fishing for coins', perms: 'Everyone', cooldown: '30s' },
      { name: 'rob', usage: '/rob <user>', description: 'Rob a user', perms: 'Everyone', cooldown: '60s' },
      { name: 'deposit', usage: '/deposit <amount>', description: 'Deposit coins to bank', perms: 'Everyone', cooldown: '3s' },
      { name: 'bank', usage: '/bank', description: 'Check bank balance', perms: 'Everyone', cooldown: '3s' },
      { name: 'give', usage: '/give <user> <amount>', description: 'Give coins to another user', perms: 'Everyone', cooldown: '10s' },
      { name: 'coinflip', usage: '/coinflip <amount>', description: 'Bet coins on coin flip', perms: 'Everyone', cooldown: '5s' },
    ],
  },
  {
    name: 'Giveaway', emoji: '🎉', description: 'Host giveaways with role and invite requirements',
    commands: [
      { name: 'giveaway start', usage: '/giveaway start', description: 'Start a giveaway', perms: 'Administrator', cooldown: '10s' },
      { name: 'giveaway end', usage: '/giveaway end <messageId>', description: 'End a giveaway early', perms: 'Administrator', cooldown: '3s' },
      { name: 'giveaway reroll', usage: '/giveaway reroll <messageId>', description: 'Reroll winners', perms: 'Administrator', cooldown: '3s' },
    ],
  },
  {
    name: 'Ticket System', emoji: '🎫', description: 'Full support ticket system with transcripts',
    commands: [
      { name: 'ticketsetup', usage: '/ticketsetup <#channel>', description: 'Post ticket panel', perms: 'Administrator', cooldown: '5s' },
      { name: 'ticket close', usage: '/ticket close [reason]', description: 'Close a ticket', perms: 'Support Role', cooldown: '3s' },
      { name: 'ticket claim', usage: '/ticket claim', description: 'Claim a ticket', perms: 'Support Role', cooldown: '3s' },
      { name: 'ticket add', usage: '/ticket add <user>', description: 'Add user to ticket', perms: 'Support Role', cooldown: '3s' },
      { name: 'ticket remove', usage: '/ticket-remove <user>', description: 'Remove user from ticket', perms: 'Support Role', cooldown: '3s' },
      { name: 'ticket rename', usage: '/ticket rename <name>', description: 'Rename ticket channel', perms: 'Support Role', cooldown: '3s' },
      { name: 'ticket claim', usage: '/ticket claim', description: 'Claim a ticket', perms: 'Support Role', cooldown: '3s' },
      { name: 'ticket unclaim', usage: '/ticket-unclaim', description: 'Unclaim a ticket', perms: 'Support Role', cooldown: '3s' },
      { name: 'ticket transcript', usage: '/ticket transcript', description: 'Get ticket transcript', perms: 'Support Role', cooldown: '10s' },
      { name: 'ticket reopen', usage: '/ticket reopen', description: 'Re-open a ticket', perms: 'Support Role', cooldown: '3s' },
    ],
  },
  {
    name: 'Verification', emoji: '✅', description: 'Button, captcha, or reaction verification',
    commands: [
      { name: 'verifysetup', usage: '/verifysetup <#channel> <@role>', description: 'Set up verification', perms: 'Administrator', cooldown: '5s' },
      { name: 'verify', usage: '/verify', description: 'Verify yourself', perms: 'Everyone', cooldown: '3s' },
      { name: 'unverify', usage: '/unverify <user>', description: 'Remove verified role', perms: 'Administrator', cooldown: '3s' },
      { name: 'verifyrole', usage: '/verifyrole <@role>', description: 'Change verified role', perms: 'Administrator', cooldown: '3s' },
      { name: 'verifymode', usage: '/verifymode <mode>', description: 'Switch verification mode', perms: 'Administrator', cooldown: '3s' },
    ],
  },
  {
    name: 'Reaction Roles', emoji: '🔁', description: 'Button and reaction-based role assignment',
    commands: [
      { name: 'reactionrole create', usage: '/reactionrole create', description: 'Create reaction roles', perms: 'Administrator', cooldown: '5s' },
      { name: 'buttonrole create', usage: '/buttonrole create', description: 'Create button roles', perms: 'Administrator', cooldown: '5s' },
    ],
  },
  {
    name: 'Analytics', emoji: '📊', description: 'Invite tracking, activity stats, server growth',
    commands: [
      { name: 'serverstats', usage: '/serverstats', description: 'Show server analytics', perms: 'Everyone', cooldown: '5s' },
      { name: 'invites', usage: '/invites [user]', description: 'Show invite counts', perms: 'Everyone', cooldown: '5s' },
      { name: 'activity', usage: '/activity', description: 'Show server activity', perms: 'Everyone', cooldown: '5s' },
    ],
  },
  {
    name: 'Fun', emoji: '🎮', description: 'Games and entertainment for your community',
    commands: [
      { name: 'meme', usage: '/meme', description: 'Get a random meme', perms: 'Everyone', cooldown: '3s' },
      { name: '8ball', usage: '/8ball <question>', description: 'Ask the magic 8-ball', perms: 'Everyone', cooldown: '3s' },
      { name: 'guessnumber', usage: '/guessnumber', description: 'Guess the number game', perms: 'Everyone', cooldown: '10s' },
    ],
  },
  {
    name: 'Anime', emoji: '🎌', description: 'Anime, manga, waifu and character lookups',
    commands: [
      { name: 'anime', usage: '/anime <name>', description: 'Search for an anime', perms: 'Everyone', cooldown: '3s' },
      { name: 'manga', usage: '/manga <name>', description: 'Search for a manga', perms: 'Everyone', cooldown: '3s' },
      { name: 'waifu', usage: '/waifu', description: 'Random waifu image', perms: 'Everyone', cooldown: '3s' },
      { name: 'character', usage: '/character <name>', description: 'Character info lookup', perms: 'Everyone', cooldown: '3s' },
      { name: 'animequote', usage: '/animequote', description: 'Random anime quote', perms: 'Everyone', cooldown: '3s' },
    ],
  },
  {
    name: 'Social', emoji: '💬', description: 'Confessions, truth or dare, matchmaking and more',
    commands: [
      { name: 'confess', usage: '/confess <message>', description: 'Anonymous confession', perms: 'Everyone', cooldown: '30s' },
      { name: 'truth', usage: '/truth', description: 'Random truth question', perms: 'Everyone', cooldown: '5s' },
      { name: 'dare', usage: '/dare', description: 'Random dare challenge', perms: 'Everyone', cooldown: '5s' },
      { name: 'matchmaking', usage: '/matchmaking', description: 'Match two members', perms: 'Everyone', cooldown: '10s' },
    ],
  },
  {
    name: 'AI', emoji: '🧠', description: 'Ask questions and generate images using Gemini AI',
    commands: [
      { name: 'ask', usage: '/ask <prompt>', description: 'Ask Gemini AI a question', perms: 'Everyone', cooldown: '10s' },
      { name: 'createimage', usage: '/createimage <prompt>', description: 'Generate an image with AI', perms: 'Everyone', cooldown: '30s' },
    ],
  },
  {
    name: 'Utilities', emoji: '🔧', description: 'General purpose tools for everyday use',
    commands: [
      { name: 'help', usage: '/help', description: 'Show help menu', perms: 'Everyone', cooldown: '3s' },
      { name: 'ping', usage: '/ping', description: 'Show bot latency', perms: 'Everyone', cooldown: '3s' },
      { name: 'botinfo', usage: '/botinfo', description: 'Show bot information', perms: 'Everyone', cooldown: '3s' },
      { name: 'serverinfo', usage: '/serverinfo', description: 'Show server information', perms: 'Everyone', cooldown: '3s' },
      { name: 'userinfo', usage: '/userinfo [user]', description: 'Show user information', perms: 'Everyone', cooldown: '3s' },
      { name: 'avatar', usage: '/avatar [user]', description: "Show user's avatar", perms: 'Everyone', cooldown: '3s' },
      { name: 'banner', usage: '/banner [user]', description: "Show user's banner", perms: 'Everyone', cooldown: '3s' },
      { name: 'afk', usage: '/afk [reason]', description: 'Set AFK status', perms: 'Everyone', cooldown: '3s' },
      { name: 'membercount', usage: '/membercount', description: 'Show member count', perms: 'Everyone', cooldown: '3s' },
      { name: 'snipe', usage: '/snipe', description: 'Show last deleted message', perms: 'Everyone', cooldown: '5s' },
      { name: 'reminder', usage: '/reminder <time> <message>', description: 'Set a reminder', perms: 'Everyone', cooldown: '10s' },
      { name: 'poll', usage: '/poll <question> <options>', description: 'Create a poll', perms: 'Everyone', cooldown: '10s' },
      { name: 'giverole', usage: '/giverole <user> <role>', description: 'Give a role to a user', perms: 'Administrator', cooldown: '3s' },
      { name: 'roleall', usage: '/roleall <role>', description: 'Give role to all members', perms: 'Administrator', cooldown: '30s' },
    ],
  },
  {
    name: 'Config', emoji: '⚙️', description: 'Configure Axion for your server',
    commands: [
      { name: 'setchannel', usage: '/setchannel <type> <#channel>', description: 'Set a channel', perms: 'Administrator', cooldown: '3s' },
      { name: 'setlanguage', usage: '/setlanguage <language>', description: 'Set server language', perms: 'Administrator', cooldown: '3s' },
    ],
  },
  {
    name: 'Birthday', emoji: '🎂', description: 'Birthday announcements and tracking',
    commands: [
      { name: 'birthday set', usage: '/birthday set <date>', description: 'Set your birthday', perms: 'Everyone', cooldown: '5s' },
      { name: 'birthday check', usage: '/birthday check [user]', description: 'Check birthday', perms: 'Everyone', cooldown: '3s' },
      { name: 'birthday list', usage: '/birthday list', description: 'List all birthdays', perms: 'Everyone', cooldown: '5s' },
    ],
  },
  {
    name: 'Quotes', emoji: '💭', description: 'Save and recall memorable quotes',
    commands: [
      { name: 'quote add', usage: '/quote add <text>', description: 'Save a quote', perms: 'Everyone', cooldown: '3s' },
      { name: 'quote random', usage: '/quote random', description: 'Get random quote', perms: 'Everyone', cooldown: '3s' },
      { name: 'quote list', usage: '/quote list', description: 'List all quotes', perms: 'Everyone', cooldown: '5s' },
    ],
  },
  {
    name: 'Sticky Msg', emoji: '📌', description: 'Keep important messages pinned at the bottom',
    commands: [
      { name: 'sticky set', usage: '/sticky set <message>', description: 'Set a sticky message', perms: 'Administrator', cooldown: '3s' },
      { name: 'sticky remove', usage: '/sticky remove', description: 'Remove sticky message', perms: 'Administrator', cooldown: '3s' },
    ],
  },
  {
    name: 'Adv. Polls', emoji: '📣', description: 'Advanced polls with time limits and role gates',
    commands: [
      { name: 'advancedpoll create', usage: '/advancedpoll create', description: 'Create advanced poll', perms: 'Administrator', cooldown: '10s' },
      { name: 'advancedpoll end', usage: '/advancedpoll end <id>', description: 'End a poll', perms: 'Administrator', cooldown: '3s' },
    ],
  },
  {
    name: 'Auto-Roles', emoji: '👤', description: 'Automatically assign roles on member join',
    commands: [
      { name: 'autorole add', usage: '/autorole add <role>', description: 'Add auto-role', perms: 'Administrator', cooldown: '3s' },
      { name: 'autorole remove', usage: '/autorole remove <role>', description: 'Remove auto-role', perms: 'Administrator', cooldown: '3s' },
      { name: 'autorole list', usage: '/autorole list', description: 'List auto-roles', perms: 'Administrator', cooldown: '3s' },
    ],
  },
  {
    name: 'Starboard', emoji: '⭐', description: 'Highlight the best messages in a dedicated channel',
    commands: [
      { name: 'starboard setup', usage: '/starboard setup <#channel> [threshold]', description: 'Set up starboard', perms: 'Administrator', cooldown: '5s' },
      { name: 'starboard config', usage: '/starboard config', description: 'Starboard settings', perms: 'Administrator', cooldown: '3s' },
      { name: 'starboard emoji', usage: '/starboard emoji <emoji>', description: 'Change star emoji', perms: 'Administrator', cooldown: '3s' },
      { name: 'starboard disable', usage: '/starboard disable', description: 'Disable starboard', perms: 'Administrator', cooldown: '3s' },
    ],
  },
  {
    name: 'Custom Cmds', emoji: '🔧', description: 'Create custom commands for your server',
    commands: [
      { name: 'customcmd add', usage: '/customcmd add <trigger> <response>', description: 'Add custom command', perms: 'Administrator', cooldown: '3s' },
      { name: 'customcmd edit', usage: '/customcmd edit <trigger> <response>', description: 'Edit custom command', perms: 'Administrator', cooldown: '3s' },
      { name: 'customcmd remove', usage: '/customcmd remove <trigger>', description: 'Remove custom command', perms: 'Administrator', cooldown: '3s' },
      { name: 'customcmd list', usage: '/customcmd list', description: 'List custom commands', perms: 'Administrator', cooldown: '5s' },
    ],
  },
  {
    name: 'Temp VC', emoji: '🔊', description: 'Temporary voice channels on demand',
    commands: [
      { name: 'tempvc setup', usage: '/tempvc setup <#channel>', description: 'Set up temp VCs', perms: 'Administrator', cooldown: '5s' },
      { name: 'tempvc name', usage: '/tempvc name <template>', description: 'Set VC name template', perms: 'Administrator', cooldown: '3s' },
      { name: 'tempvc limit', usage: '/tempvc limit <number>', description: 'Set user limit', perms: 'Administrator', cooldown: '3s' },
      { name: 'tempvc disable', usage: '/tempvc disable', description: 'Disable temp VCs', perms: 'Administrator', cooldown: '3s' },
    ],
  },
  {
    name: 'Counting', emoji: '🔢', description: 'Server counting game channel',
    commands: [
      { name: 'counting setup', usage: '/counting setup <#channel>', description: 'Set counting channel', perms: 'Administrator', cooldown: '5s' },
      { name: 'counting reset', usage: '/counting reset', description: 'Reset count to 0', perms: 'Administrator', cooldown: '3s' },
      { name: 'counting stats', usage: '/counting stats', description: 'Show counting stats', perms: 'Everyone', cooldown: '3s' },
      { name: 'counting disable', usage: '/counting disable', description: 'Disable counting', perms: 'Administrator', cooldown: '3s' },
    ],
  },
  {
    name: 'Bump Reminder', emoji: '📢', description: 'Get reminded to bump your server',
    commands: [
      { name: 'bumper setup', usage: '/bumper setup <#channel> [role]', description: 'Set bump reminder', perms: 'Administrator', cooldown: '5s' },
      { name: 'bumper disable', usage: '/bumper disable', description: 'Disable bump reminders', perms: 'Administrator', cooldown: '3s' },
      { name: 'bumper status', usage: '/bumper status', description: 'Check bump status', perms: 'Everyone', cooldown: '5s' },
    ],
  },
  {
    name: 'Reports', emoji: '📋', description: 'Anonymous user reporting system',
    commands: [
      { name: 'reportsetup', usage: '/reportsetup <#channel>', description: 'Set report channel', perms: 'Administrator', cooldown: '5s' },
      { name: 'report', usage: '/report <user> <reason>', description: 'Report a user', perms: 'Everyone', cooldown: '30s' },
      { name: 'reports view', usage: '/reports view [user]', description: 'View reports', perms: 'Administrator', cooldown: '5s' },
      { name: 'reports clear', usage: '/reports clear', description: 'Clear resolved reports', perms: 'Administrator', cooldown: '3s' },
    ],
  },
  {
    name: 'Scheduler', emoji: '📅', description: 'Schedule messages to be sent later',
    commands: [
      { name: 'schedule', usage: '/schedule <#channel> <time> <message>', description: 'Schedule a message', perms: 'Administrator', cooldown: '5s' },
      { name: 'schedule list', usage: '/schedule list', description: 'List scheduled messages', perms: 'Administrator', cooldown: '5s' },
      { name: 'schedule cancel', usage: '/schedule cancel <id>', description: 'Cancel a message', perms: 'Administrator', cooldown: '3s' },
    ],
  },
  {
    name: 'Server Stats', emoji: '📊', description: 'Live server statistics in voice channels',
    commands: [
      { name: 'serverstats setup', usage: '/serverstats setup', description: 'Setup stat channels', perms: 'Administrator', cooldown: '10s' },
      { name: 'serverstats add', usage: '/serverstats add <type>', description: 'Add stat channel', perms: 'Administrator', cooldown: '5s' },
      { name: 'serverstats remove', usage: '/serverstats remove <type>', description: 'Remove stat channel', perms: 'Administrator', cooldown: '5s' },
      { name: 'serverstats disable', usage: '/serverstats disable', description: 'Disable stat channels', perms: 'Administrator', cooldown: '5s' },
    ],
  },
];

module.exports = helpCategories;
