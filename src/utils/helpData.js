const helpCategories = [
  {
    name: 'Moderation',
    emoji: '🛡️',
    description: 'Server moderation commands',
    commands: [
      { name: 'ban', usage: '/ban <user> [reason]', description: 'Ban a member from the server', perms: ['BanMembers'], cooldown: 5 },
      { name: 'kick', usage: '/kick <user> [reason]', description: 'Kick a member from the server', perms: ['KickMembers'], cooldown: 5 },
      { name: 'mute', usage: '/mute <user> <duration> [reason]', description: 'Timeout a member', perms: ['ModerateMembers'], cooldown: 5 },
      { name: 'unmute', usage: '/unmute <user>', description: 'Remove timeout from a member', perms: ['ModerateMembers'], cooldown: 5 },
      { name: 'warn', usage: '/warn <user> [reason]', description: 'Warn a member', perms: ['ModerateMembers'], cooldown: 5 },
      { name: 'warnings', usage: '/warnings <user>', description: 'View warnings for a member', perms: ['ModerateMembers'], cooldown: 3 },
      { name: 'clear', usage: '/clear [amount]', description: 'Bulk delete messages', perms: ['ManageMessages'], cooldown: 5 },
      { name: 'lock', usage: '/lock [channel]', description: 'Lock a channel', perms: ['ManageChannels'], cooldown: 3 },
      { name: 'unlock', usage: '/unlock [channel]', description: 'Unlock a channel', perms: ['ManageChannels'], cooldown: 3 },
    ],
  },
  {
    name: 'Anti-Nuke',
    emoji: '💣',
    description: 'Protection against server raids and nukes',
    commands: [
      { name: 'antinuke', usage: '/antinuke <action>', description: 'Configure anti-nuke protection', perms: ['Administrator'], cooldown: 10 },
      { name: 'antiraid', usage: '/antiraid <action>', description: 'Toggle raid mode', perms: ['Administrator'], cooldown: 10 },
      { name: 'whitelist', usage: '/whitelist <action> <user>', description: 'Manage anti-nuke whitelist', perms: ['Administrator'], cooldown: 5 },
    ],
  },
  {
    name: 'Logging',
    emoji: '📜',
    description: 'Server event logging commands',
    commands: [
      { name: 'log set', usage: '/log set <type> <channel>', description: 'Set a logging channel', perms: ['ManageGuild'], cooldown: 10 },
      { name: 'log remove', usage: '/log remove <type>', description: 'Remove a logging channel', perms: ['ManageGuild'], cooldown: 10 },
      { name: 'log list', usage: '/log list', description: 'List all logging channels', perms: ['ManageGuild'], cooldown: 5 },
    ],
  },
  {
    name: 'Auto-Mod',
    emoji: '🤖',
    description: 'Automatic moderation commands',
    commands: [
      { name: 'automod', usage: '/automod <rule> <action>', description: 'Configure auto-mod rules', perms: ['ManageGuild'], cooldown: 10 },
      { name: 'automod list', usage: '/automod list', description: 'List active auto-mod rules', perms: ['ManageGuild'], cooldown: 5 },
    ],
  },
  {
    name: 'Welcome/Farewell',
    emoji: '👋',
    description: 'Welcome and farewell message commands',
    commands: [
      { name: 'welcome set', usage: '/welcome set <channel> [message]', description: 'Set welcome channel and message', perms: ['ManageGuild'], cooldown: 10 },
      { name: 'welcome test', usage: '/welcome test', description: 'Test welcome message', perms: ['ManageGuild'], cooldown: 10 },
      { name: 'farewell set', usage: '/farewell set <channel> [message]', description: 'Set farewell channel and message', perms: ['ManageGuild'], cooldown: 10 },
      { name: 'farewell test', usage: '/farewell test', description: 'Test farewell message', perms: ['ManageGuild'], cooldown: 10 },
    ],
  },
  {
    name: 'Leveling',
    emoji: '📈',
    description: 'Leveling and XP commands',
    commands: [
      { name: 'rank', usage: '/rank [user]', description: 'Check your or another user\'s rank', perms: [], cooldown: 5 },
      { name: 'leaderboard', usage: '/leaderboard', description: 'View server level leaderboard', perms: [], cooldown: 10 },
      { name: 'level config', usage: '/level config', description: 'Configure leveling settings', perms: ['ManageGuild'], cooldown: 10 },
      { name: 'level reward', usage: '/level reward <level> <role>', description: 'Set role rewards for levels', perms: ['ManageGuild'], cooldown: 10 },
    ],
  },
  {
    name: 'Economy',
    emoji: '💰',
    description: 'Economy and currency commands',
    commands: [
      { name: 'balance', usage: '/balance [user]', description: 'Check your or another user\'s balance', perms: [], cooldown: 3 },
      { name: 'daily', usage: '/daily', description: 'Claim your daily reward', perms: [], cooldown: 86400 },
      { name: 'weekly', usage: '/weekly', description: 'Claim your weekly reward', perms: [], cooldown: 604800 },
      { name: 'pay', usage: '/pay <user> <amount>', description: 'Transfer coins to another user', perms: [], cooldown: 5 },
      { name: 'shop', usage: '/shop', description: 'View the server shop', perms: [], cooldown: 3 },
      { name: 'buy', usage: '/buy <item>', description: 'Buy an item from the shop', perms: [], cooldown: 5 },
      { name: 'work', usage: '/work', description: 'Work to earn coins', perms: [], cooldown: 3600 },
      { name: 'gamble', usage: '/gamble <amount>', description: 'Gamble your coins', perms: [], cooldown: 10 },
    ],
  },
  {
    name: 'Giveaway',
    emoji: '🎉',
    description: 'Giveaway management commands',
    commands: [
      { name: 'giveaway start', usage: '/giveaway start <duration> <winners> <prize>', description: 'Start a giveaway', perms: ['ManageGuild'], cooldown: 30 },
      { name: 'giveaway end', usage: '/giveaway end <message_id>', description: 'End a giveaway early', perms: ['ManageGuild'], cooldown: 10 },
      { name: 'giveaway reroll', usage: '/giveaway reroll <message_id>', description: 'Reroll a giveaway winner', perms: ['ManageGuild'], cooldown: 10 },
    ],
  },
  {
    name: 'Ticket System',
    emoji: '🎫',
    description: 'Ticket management commands',
    commands: [
      { name: 'ticket setup', usage: '/ticket setup <channel>', description: 'Set up the ticket panel', perms: ['ManageGuild'], cooldown: 30 },
      { name: 'ticket close', usage: '/ticket close', description: 'Close a ticket', perms: [], cooldown: 5 },
      { name: 'ticket add', usage: '/ticket add <user>', description: 'Add a user to a ticket', perms: [], cooldown: 3 },
      { name: 'ticket remove', usage: '/ticket remove <user>', description: 'Remove a user from a ticket', perms: [], cooldown: 3 },
    ],
  },
  {
    name: 'Verification',
    emoji: '✅',
    description: 'Member verification commands',
    commands: [
      { name: 'verify setup', usage: '/verify setup <channel> <role>', description: 'Set up verification system', perms: ['ManageGuild'], cooldown: 30 },
      { name: 'verify config', usage: '/verify config', description: 'Configure verification settings', perms: ['ManageGuild'], cooldown: 10 },
    ],
  },
  {
    name: 'Reaction Roles',
    emoji: '😊',
    description: 'Reaction role commands',
    commands: [
      { name: 'rr create', usage: '/rr create <channel> <message_id> <emoji> <role>', description: 'Create a reaction role', perms: ['ManageRoles'], cooldown: 10 },
      { name: 'rr remove', usage: '/rr remove <message_id> <emoji>', description: 'Remove a reaction role', perms: ['ManageRoles'], cooldown: 10 },
      { name: 'rr list', usage: '/rr list', description: 'List all reaction roles', perms: ['ManageRoles'], cooldown: 5 },
    ],
  },
  {
    name: 'Analytics',
    emoji: '📊',
    description: 'Server analytics commands',
    commands: [
      { name: 'analytics', usage: '/analytics', description: 'View server analytics', perms: ['ManageGuild'], cooldown: 30 },
      { name: 'analytics members', usage: '/analytics members', description: 'View member analytics', perms: ['ManageGuild'], cooldown: 30 },
    ],
  },
  {
    name: 'Fun',
    emoji: '🎮',
    description: 'Fun and entertainment commands',
    commands: [
      { name: '8ball', usage: '/8ball <question>', description: 'Ask the magic 8-ball a question', perms: [], cooldown: 3 },
      { name: 'meme', usage: '/meme', description: 'Get a random meme', perms: [], cooldown: 3 },
      { name: 'joke', usage: '/joke', description: 'Get a random joke', perms: [], cooldown: 3 },
      { name: 'roast', usage: '/roast [user]', description: 'Roast someone', perms: [], cooldown: 5 },
      { name: 'dice', usage: '/dice [sides]', description: 'Roll a dice', perms: [], cooldown: 2 },
      { name: 'flip', usage: '/flip', description: 'Flip a coin', perms: [], cooldown: 2 },
    ],
  },
  {
    name: 'Anime',
    emoji: '🎌',
    description: 'Anime-related commands',
    commands: [
      { name: 'anime', usage: '/anime <query>', description: 'Search for an anime', perms: [], cooldown: 5 },
      { name: 'manga', usage: '/manga <query>', description: 'Search for a manga', perms: [], cooldown: 5 },
      { name: 'animequote', usage: '/animequote', description: 'Get a random anime quote', perms: [], cooldown: 3 },
    ],
  },
  {
    name: 'Social',
    emoji: '👥',
    description: 'Social interaction commands',
    commands: [
      { name: 'hug', usage: '/hug <user>', description: 'Hug someone', perms: [], cooldown: 3 },
      { name: 'kiss', usage: '/kiss <user>', description: 'Kiss someone', perms: [], cooldown: 3 },
      { name: 'slap', usage: '/slap <user>', description: 'Slap someone', perms: [], cooldown: 3 },
      { name: 'pat', usage: '/pat <user>', description: 'Pat someone', perms: [], cooldown: 3 },
      { name: 'cuddle', usage: '/cuddle <user>', description: 'Cuddle someone', perms: [], cooldown: 3 },
    ],
  },
  {
    name: 'AI',
    emoji: '🧠',
    description: 'AI-powered commands',
    commands: [
      { name: 'ask', usage: '/ask <prompt>', description: 'Ask AI a question', perms: [], cooldown: 10 },
      { name: 'chat', usage: '/chat <message>', description: 'Chat with AI', perms: [], cooldown: 5 },
      { name: 'imagine', usage: '/imagine <prompt>', description: 'Generate an image with AI', perms: [], cooldown: 30 },
    ],
  },
  {
    name: 'Utilities',
    emoji: '🔧',
    description: 'General utility commands',
    commands: [
      { name: 'ping', usage: '/ping', description: 'Check bot latency', perms: [], cooldown: 3 },
      { name: 'uptime', usage: '/uptime', description: 'Check bot uptime', perms: [], cooldown: 5 },
      { name: 'help', usage: '/help [category]', description: 'Display help menu', perms: [], cooldown: 3 },
      { name: 'invite', usage: '/invite', description: 'Get bot invite link', perms: [], cooldown: 10 },
      { name: 'vote', usage: '/vote', description: 'Vote for the bot', perms: [], cooldown: 60 },
      { name: 'serverinfo', usage: '/serverinfo', description: 'View server information', perms: [], cooldown: 5 },
      { name: 'userinfo', usage: '/userinfo [user]', description: 'View user information', perms: [], cooldown: 5 },
      { name: 'roleinfo', usage: '/roleinfo <role>', description: 'View role information', perms: [], cooldown: 5 },
      { name: 'emojiinfo', usage: '/emojiinfo <emoji>', description: 'View emoji information', perms: [], cooldown: 5 },
      { name: 'avatar', usage: '/avatar [user]', description: 'View user avatar', perms: [], cooldown: 3 },
      { name: 'banner', usage: '/banner [user]', description: 'View user banner', perms: [], cooldown: 3 },
      { name: 'snipe', usage: '/snipe', description: 'Snipe the last deleted message', perms: [], cooldown: 5 },
      { name: 'editsnipe', usage: '/editsnipe', description: 'Snipe the last edited message', perms: [], cooldown: 5 },
    ],
  },
  {
    name: 'Config',
    emoji: '⚙️',
    description: 'Bot configuration commands',
    commands: [
      { name: 'config', usage: '/config', description: 'View server configuration', perms: ['ManageGuild'], cooldown: 10 },
      { name: 'config prefix', usage: '/config prefix <prefix>', description: 'Set custom prefix', perms: ['ManageGuild'], cooldown: 30 },
      { name: 'config language', usage: '/config language <language>', description: 'Set server language', perms: ['ManageGuild'], cooldown: 30 },
    ],
  },
  {
    name: 'Birthday',
    emoji: '🎂',
    description: 'Birthday tracking commands',
    commands: [
      { name: 'birthday set', usage: '/birthday set <date>', description: 'Set your birthday', perms: [], cooldown: 60 },
      { name: 'birthday remove', usage: '/birthday remove', description: 'Remove your birthday', perms: [], cooldown: 60 },
      { name: 'birthday list', usage: '/birthday list', description: 'View upcoming birthdays', perms: [], cooldown: 10 },
      { name: 'birthday channel', usage: '/birthday channel <channel>', description: 'Set birthday announcement channel', perms: ['ManageGuild'], cooldown: 30 },
    ],
  },
  {
    name: 'Quotes',
    emoji: '💬',
    description: 'Quote management commands',
    commands: [
      { name: 'quote add', usage: '/quote add <message_link>', description: 'Save a message as a quote', perms: [], cooldown: 5 },
      { name: 'quote random', usage: '/quote random', description: 'Get a random saved quote', perms: [], cooldown: 3 },
      { name: 'quote list', usage: '/quote list', description: 'List all saved quotes', perms: [], cooldown: 5 },
    ],
  },
  {
    name: 'Sticky Msg',
    emoji: '📌',
    description: 'Sticky message commands',
    commands: [
      { name: 'sticky add', usage: '/sticky add <channel> <message>', description: 'Set a sticky message in a channel', perms: ['ManageMessages'], cooldown: 10 },
      { name: 'sticky remove', usage: '/sticky remove <channel>', description: 'Remove a sticky message', perms: ['ManageMessages'], cooldown: 10 },
      { name: 'sticky list', usage: '/sticky list', description: 'List all sticky messages', perms: ['ManageMessages'], cooldown: 5 },
    ],
  },
  {
    name: 'Adv. Polls',
    emoji: '📊',
    description: 'Advanced poll commands',
    commands: [
      { name: 'poll', usage: '/poll <question> <option1> <option2> [options...]', description: 'Create a multi-choice poll', perms: ['ManageMessages'], cooldown: 10 },
      { name: 'quickpoll', usage: '/quickpoll <question>', description: 'Create a quick yes/no poll', perms: ['ManageMessages'], cooldown: 10 },
    ],
  },
  {
    name: 'Auto-Roles',
    emoji: '🎭',
    description: 'Automatic role assignment commands',
    commands: [
      { name: 'autorole add', usage: '/autorole add <role>', description: 'Add a role to auto-assign on join', perms: ['ManageRoles'], cooldown: 10 },
      { name: 'autorole remove', usage: '/autorole remove <role>', description: 'Remove an auto-assign role', perms: ['ManageRoles'], cooldown: 10 },
      { name: 'autorole list', usage: '/autorole list', description: 'List auto-assigned roles', perms: ['ManageRoles'], cooldown: 5 },
    ],
  },
  {
    name: 'AFK',
    emoji: '🌙',
    description: 'AFK status commands',
    commands: [
      { name: 'afk', usage: '/afk [reason]', description: 'Set your AFK status', perms: [], cooldown: 10 },
      { name: 'afk remove', usage: '/afk remove', description: 'Remove your AFK status', perms: [], cooldown: 3 },
    ],
  },
  {
    name: 'Notifications',
    emoji: '🔔',
    description: 'YouTube and Twitch notification commands',
    commands: [
      { name: 'notification youtube add', usage: '/notification youtube add <channel-id> <#channel> [message]', description: 'Watch a YouTube channel for new videos', perms: ['Administrator'], cooldown: 5 },
      { name: 'notification youtube remove', usage: '/notification youtube remove <channel-id>', description: 'Stop watching a YouTube channel', perms: ['Administrator'], cooldown: 5 },
      { name: 'notification youtube list', usage: '/notification youtube list', description: 'List all YouTube notifications', perms: ['Administrator'], cooldown: 5 },
      { name: 'notification twitch add', usage: '/notification twitch add <channel-name> <#channel> [message]', description: 'Watch a Twitch channel for going live', perms: ['Administrator'], cooldown: 5 },
      { name: 'notification twitch remove', usage: '/notification twitch remove <channel-name>', description: 'Stop watching a Twitch channel', perms: ['Administrator'], cooldown: 5 },
      { name: 'notification twitch list', usage: '/notification twitch list', description: 'List all Twitch notifications', perms: ['Administrator'], cooldown: 5 },
    ],
  },
];

function flatCommands() {
  const flat = [];
  for (const category of helpCategories) {
    for (const command of category.commands) {
      flat.push({
        ...command,
        category: category.name,
        categoryEmoji: category.emoji,
      });
    }
  }
  return flat;
}

module.exports = { helpCategories, flatCommands };
