const helpCategories = [
  { name: 'Moderation',      emoji: '⚔️',  description: 'Keep your server safe and well-managed',
    commands: [
      { name: 'ban',        usage: '/ban <user> [reason]',         description: 'Ban a member from the server',            perms: 'Ban Members',      cooldown: '5s' },
      { name: 'kick',       usage: '/kick <user> [reason]',        description: 'Kick a member from the server',           perms: 'Kick Members',     cooldown: '5s' },
      { name: 'warn',       usage: '/warn <user> <reason>',        description: 'Warn a member (stored in DB)',            perms: 'Moderate Members', cooldown: '3s' },
      { name: 'mute',       usage: '/mute <user> [time] [reason]', description: 'Mute a member',                           perms: 'Moderate Members', cooldown: '5s' },
      { name: 'unmute',     usage: '/unmute <user>',               description: 'Unmute a member',                         perms: 'Moderate Members', cooldown: '3s' },
      { name: 'lock',       usage: '/lock [channel]',              description: 'Lock a channel',                          perms: 'Manage Channels',  cooldown: '3s' },
      { name: 'unlock',     usage: '/unlock [channel]',            description: 'Unlock a channel',                        perms: 'Manage Channels',  cooldown: '3s' },
      { name: 'jail',       usage: '/jail <user> [reason]',        description: 'Jail a member',                           perms: 'Administrator',    cooldown: '5s' },
      { name: 'unjail',     usage: '/unjail <user>',               description: 'Release a jailed member',                 perms: 'Administrator',    cooldown: '3s' },
      { name: 'nickname',   usage: '/nickname <user> <name>',      description: 'Change a member\'s nickname',             perms: 'Manage Nicknames', cooldown: '3s' },
      { name: 'slowmode',   usage: '/slowmode <seconds>',          description: 'Set channel slowmode',                    perms: 'Manage Channels',  cooldown: '3s' },
      { name: 'clear',      usage: '/clear <amount> [user]',       description: 'Bulk delete messages',                    perms: 'Administrator',    cooldown: '5s' },
    ]
  },
  { name: 'Anti-Nuke',  emoji: '🛡️',  description: 'Protect your server from raids and nukes',
    commands: [
      { name: 'antinuke', usage: '/antinuke <config|enable|disable>', description: 'Manage anti-nuke protection', perms: 'Administrator', cooldown: '5s' },
    ]
  },
  { name: 'Logging',    emoji: '📋',  description: 'Track events and changes in your server',
    commands: [
      { name: 'logging', usage: '/logging <enable|disable>', description: 'Toggle server logging', perms: 'Administrator', cooldown: '5s' },
    ]
  },
  { name: 'Auto-Mod',   emoji: '🤖',  description: 'Automatically moderate messages and behaviour',
    commands: [
      { name: 'automod', usage: '/automod <config|enable|disable>', description: 'Manage auto-moderation', perms: 'Administrator', cooldown: '5s' },
    ]
  },
  { name: 'Welcome / Farewell', emoji: '👋', description: 'Greet new members and farewell those who leave',
    commands: [
      { name: 'setchannel', usage: '/setchannel <type> <channel>', description: 'Set welcome/farewell channel', perms: 'Administrator', cooldown: '5s' },
      { name: 'setcustommessage', usage: '/setcustommessage <type> <message>', description: 'Set custom welcome/farewell message', perms: 'Administrator', cooldown: '5s' },
    ]
  },
  { name: 'Leveling',   emoji: '⭐',  description: 'XP system — earn levels through activity',
    commands: [
      { name: 'addxp', usage: '/addxp <user> <amount>', description: 'Add XP to a user', perms: 'Administrator', cooldown: '5s' },
      { name: 'removexp', usage: '/removexp <user> <amount>', description: 'Remove XP from a user', perms: 'Administrator', cooldown: '5s' },
      { name: 'xpleaderboard', usage: '/xpleaderboard', description: 'View XP leaderboard', perms: 'Everyone', cooldown: '5s' },
      { name: 'xpprofile', usage: '/xpprofile [user]', description: 'View XP profile card', perms: 'Everyone', cooldown: '3s' },
    ]
  },
  { name: 'Economy',    emoji: '💰',  description: 'Coins, banking, gambling and more',
    commands: [
      { name: 'daily', usage: '/daily', description: 'Claim daily coins', perms: 'Everyone', cooldown: '24h' },
      { name: 'bank', usage: '/bank', description: 'View and manage your bank account', perms: 'Everyone', cooldown: '3s' },
      { name: 'deposit', usage: '/deposit <amount>', description: 'Deposit coins into your bank', perms: 'Everyone', cooldown: '3s' },
      { name: 'withdraw', usage: '/withdraw <amount>', description: 'Withdraw coins from your bank', perms: 'Everyone', cooldown: '3s' },
      { name: 'give', usage: '/give <user> <amount>', description: 'Give coins to another user', perms: 'Everyone', cooldown: '5s' },
      { name: 'rob', usage: '/rob <user>', description: 'Try to rob another user', perms: 'Everyone', cooldown: '60s' },
      { name: 'work', usage: '/work', description: 'Work to earn coins', perms: 'Everyone', cooldown: '30m' },
      { name: 'fish', usage: '/fish', description: 'Go fishing for coins', perms: 'Everyone', cooldown: '30s' },
      { name: 'coinflip', usage: '/coinflip <bet>', description: 'Bet on a coin flip', perms: 'Everyone', cooldown: '3s' },
      { name: 'leaderboard', usage: '/leaderboard', description: 'View economy leaderboard', perms: 'Everyone', cooldown: '5s' },
      { name: 'profile', usage: '/profile [user]', description: 'View economy profile', perms: 'Everyone', cooldown: '3s' },
    ]
  },
  { name: 'Giveaway',   emoji: '🎉',  description: 'Host giveaways with role and invite requirements',
    commands: [
      { name: 'giveaway', usage: '/giveaway <start|end|reroll>', description: 'Manage giveaways', perms: 'Administrator', cooldown: '5s' },
    ]
  },
  { name: 'Ticket System', emoji: '🎫', description: 'Full support ticket system with transcripts',
    commands: [
      { name: 'ticket', usage: '/ticket <setup|add|close|claim|unclaim|reopen|rename|blacklist|unblacklist|stats|transcript>', description: 'Complete ticket management', perms: 'Manage Channels', cooldown: '3s' },
    ]
  },
  { name: 'Verification',  emoji: '✅', description: 'Button, captcha, or reaction verification',
    commands: [
      { name: 'verify', usage: '/verify <start|setup|role|mode|message|log|check|all|reset|unverify>', description: 'Complete verification system', perms: 'Administrator', cooldown: '3s' },
    ]
  },
  { name: 'Reaction Roles', emoji: '🔁', description: 'Button and reaction-based role assignment',
    commands: [
      { name: 'reactionrole', usage: '/reactionrole', description: 'Create reaction role panels', perms: 'Manage Roles', cooldown: '5s' },
      { name: 'buttonrole', usage: '/buttonrole', description: 'Create button role panels', perms: 'Manage Roles', cooldown: '5s' },
    ]
  },
  { name: 'Analytics',  emoji: '📊',  description: 'Invite tracking, activity stats, server growth',
    commands: [
      { name: 'activity', usage: '/activity [user]', description: 'View user activity stats', perms: 'Everyone', cooldown: '5s' },
      { name: 'invites', usage: '/invites [user]', description: 'View invite tracker stats', perms: 'Everyone', cooldown: '5s' },
      { name: 'serveranalytics', usage: '/serveranalytics', description: 'View server growth stats', perms: 'Everyone', cooldown: '10s' },
    ]
  },
  { name: 'Fun',        emoji: '🎮',  description: 'Games and entertainment for your community',
    commands: [
      { name: '8ball', usage: '/8ball <question>', description: 'Ask the magic 8-ball a question', perms: 'Everyone', cooldown: '3s' },
      { name: 'coinflip', usage: '/coinflip', description: 'Flip a coin', perms: 'Everyone', cooldown: '2s' },
      { name: 'guessnumber', usage: '/guessnumber', description: 'Guess a number between 1-10', perms: 'Everyone', cooldown: '5s' },
      { name: 'meme', usage: '/meme', description: 'Get a random meme', perms: 'Everyone', cooldown: '3s' },
      { name: 'truth', usage: '/truth', description: 'Get a random truth question', perms: 'Everyone', cooldown: '3s' },
      { name: 'dare', usage: '/dare', description: 'Get a random dare', perms: 'Everyone', cooldown: '3s' },
    ]
  },
  { name: 'Anime',      emoji: '🎌',  description: 'Anime, manga, waifu and character lookups',
    commands: [
      { name: 'anime', usage: '/anime <query>', description: 'Search for an anime', perms: 'Everyone', cooldown: '5s' },
      { name: 'manga', usage: '/manga <query>', description: 'Search for a manga', perms: 'Everyone', cooldown: '5s' },
      { name: 'animequote', usage: '/animequote', description: 'Get a random anime quote', perms: 'Everyone', cooldown: '3s' },
      { name: 'animerandom', usage: '/animerandom', description: 'Get a random anime recommendation', perms: 'Everyone', cooldown: '5s' },
      { name: 'character', usage: '/character <name>', description: 'Search for an anime character', perms: 'Everyone', cooldown: '5s' },
      { name: 'waifu', usage: '/waifu', description: 'Get a random waifu image', perms: 'Everyone', cooldown: '3s' },
      { name: 'movierecommend', usage: '/movierecommend', description: 'Get a movie recommendation', perms: 'Everyone', cooldown: '5s' },
    ]
  },
  { name: 'Social',     emoji: '💬',  description: 'Confessions, truth or dare, matchmaking and more',
    commands: [
      { name: 'confess', usage: '/confess <message>', description: 'Send an anonymous confession', perms: 'Everyone', cooldown: '30s' },
      { name: 'dailyquestion', usage: '/dailyquestion', description: 'Get the daily question', perms: 'Everyone', cooldown: '3s' },
      { name: 'matchmaking', usage: '/matchmaking', description: 'Find your match in the server', perms: 'Everyone', cooldown: '10s' },
    ]
  },
  { name: 'AI',         emoji: '🧠',  description: 'Ask questions and generate images using Gemini AI',
    commands: [
      { name: 'ask', usage: '/ask <prompt>', description: 'Ask AI any question', perms: 'Everyone', cooldown: '10s' },
      { name: 'createimage', usage: '/createimage <prompt>', description: 'Generate an AI image', perms: 'Everyone', cooldown: '30s' },
    ]
  },
  { name: 'Utilities',  emoji: '🔧',  description: 'General purpose tools for everyday use',
    commands: [
      { name: 'ping', usage: '/ping', description: 'Check bot latency', perms: 'Everyone', cooldown: '3s' },
      { name: 'help', usage: '/help [category]', description: 'Display interactive help menu', perms: 'Everyone', cooldown: '3s' },
      { name: 'botinfo', usage: '/botinfo', description: 'View bot information', perms: 'Everyone', cooldown: '5s' },
      { name: 'serverinfo', usage: '/serverinfo', description: 'View server information', perms: 'Everyone', cooldown: '5s' },
      { name: 'userinfo', usage: '/userinfo [user]', description: 'View user information', perms: 'Everyone', cooldown: '5s' },
      { name: 'avatar', usage: '/avatar [user]', description: 'View a user\'s avatar', perms: 'Everyone', cooldown: '3s' },
      { name: 'banner', usage: '/banner [user]', description: 'View a user\'s banner', perms: 'Everyone', cooldown: '3s' },
      { name: 'membercount', usage: '/membercount', description: 'View server member count', perms: 'Everyone', cooldown: '5s' },
      { name: 'roleall', usage: '/roleall <role>', description: 'Assign a role to all members', perms: 'Administrator', cooldown: '30s' },
      { name: 'giverole', usage: '/giverole <user> <role>', description: 'Give a role to a user', perms: 'Manage Roles', cooldown: '3s' },
      { name: 'poll', usage: '/poll <question>', description: 'Create a quick yes/no poll', perms: 'Everyone', cooldown: '5s' },
      { name: 'reminder', usage: '/reminder <time> <text>', description: 'Set a reminder', perms: 'Everyone', cooldown: '10s' },
      { name: 'snipe', usage: '/snipe', description: 'View the last deleted message', perms: 'Everyone', cooldown: '5s' },
      { name: 'afk', usage: '/afk [reason]', description: 'Set your AFK status', perms: 'Everyone', cooldown: '10s' },
      { name: 'afkend', usage: '/afkend', description: 'Remove your AFK status', perms: 'Everyone', cooldown: '3s' },
    ]
  },
  { name: 'Config',     emoji: '⚙️',  description: 'Configure Axion for your server',
    commands: [
      { name: 'setprefix', usage: '/setprefix <prefix>', description: 'Set the command prefix', perms: 'Administrator', cooldown: '5s' },
      { name: 'setlanguage', usage: '/setlanguage <language>', description: 'Set server language', perms: 'Administrator', cooldown: '5s' },
      { name: 'setchannel', usage: '/setchannel <type> <channel>', description: 'Set feature channels', perms: 'Administrator', cooldown: '5s' },
      { name: 'setcustommessage', usage: '/setcustommessage <type> <message>', description: 'Set custom event messages', perms: 'Administrator', cooldown: '5s' },
      { name: 'setaichannel', usage: '/setaichannel <channel>', description: 'Set AI auto-respond channel', perms: 'Administrator', cooldown: '5s' },
    ]
  },
  { name: 'Birthday',   emoji: '🎂',  description: 'Birthday announcements and tracking',
    commands: [
      { name: 'birthday', usage: '/birthday <set|remove|list|channel>', description: 'Manage birthdays', perms: 'Everyone', cooldown: '5s' },
    ]
  },
  { name: 'Quotes',     emoji: '💭',  description: 'Save and recall memorable quotes',
    commands: [
      { name: 'quote', usage: '/quote <add|random|list>', description: 'Manage saved quotes', perms: 'Everyone', cooldown: '5s' },
    ]
  },
  { name: 'Sticky Msg', emoji: '📌',  description: 'Keep important messages pinned at the bottom',
    commands: [
      { name: 'sticky', usage: '/sticky <set|remove>', description: 'Manage sticky messages', perms: 'Administrator', cooldown: '5s' },
    ]
  },
  { name: 'Adv. Polls', emoji: '📣',  description: 'Advanced polls with time limits and role gates',
    commands: [
      { name: 'advancedpoll', usage: '/advancedpoll <create|end|results>', description: 'Advanced polls', perms: 'Manage Messages', cooldown: '5s' },
    ]
  },
  { name: 'Auto-Roles', emoji: '👤',  description: 'Automatically assign roles on member join',
    commands: [
      { name: 'autorole', usage: '/autorole <add|remove|list>', description: 'Manage auto-roles', perms: 'Manage Roles', cooldown: '5s' },
    ]
  },
  { name: 'Notifications', emoji: '🔔', description: 'YouTube and Twitch live notifications',
    commands: [
      { name: 'notification', usage: '/notification <youtube|twitch> <add|remove|list>', description: 'Manage video/live notifications', perms: 'Administrator', cooldown: '5s' },
    ]
  },
  { name: 'Starboard', emoji: '⭐', description: 'Highlight popular messages with star reactions',
    commands: [
      { name: 'starboard', usage: '/starboard <config|setup|disable>', description: 'Manage starboard', perms: 'Administrator', cooldown: '5s' },
    ]
  },
  { name: 'Custom Commands', emoji: '🔨', description: 'Create server-specific custom commands',
    commands: [
      { name: 'customcmd', usage: '/customcmd <add|edit|list|remove>', description: 'Manage custom commands', perms: 'Administrator', cooldown: '5s' },
    ]
  },
  { name: 'Temp VC', emoji: '🔊', description: 'Temporary voice channel management',
    commands: [
      { name: 'tempvc', usage: '/tempvc <setup|config>', description: 'Manage temporary voice channels', perms: 'Administrator', cooldown: '5s' },
    ]
  },
  { name: 'Counting', emoji: '🔢', description: 'Counting channel game for your server',
    commands: [
      { name: 'counting', usage: '/counting <setup|reset|stats>', description: 'Manage counting channels', perms: 'Administrator', cooldown: '5s' },
    ]
  },
  { name: 'Reports', emoji: '📝', description: 'User report system with mod review',
    commands: [
      { name: 'report', usage: '/report <user> <reason>', description: 'Report a user to staff', perms: 'Everyone', cooldown: '30s' },
      { name: 'reportsetup', usage: '/reportsetup <channel>', description: 'Set up the report system', perms: 'Administrator', cooldown: '5s' },
      { name: 'reports', usage: '/reports', description: 'View pending reports', perms: 'Manage Messages', cooldown: '5s' },
    ]
  },
  { name: 'Scheduler', emoji: '📅', description: 'Schedule one-time or recurring messages',
    commands: [
      { name: 'schedule', usage: '/schedule <create|cancel|list>', description: 'Manage scheduled messages', perms: 'Manage Messages', cooldown: '5s' },
    ]
  },
  { name: 'Bump', emoji: '📢', description: 'Server bump reminder system',
    commands: [
      { name: 'bumper', usage: '/bumper <setup|disable>', description: 'Manage bump reminders', perms: 'Administrator', cooldown: '5s' },
    ]
  },
  { name: 'Server Stats', emoji: '📈', description: 'Automatic server stats in channel names',
    commands: [
      { name: 'serverstats', usage: '/serverstats <setup|add|remove>', description: 'Manage server stats channels', perms: 'Administrator', cooldown: '5s' },
    ]
  },
];

module.exports = helpCategories;
