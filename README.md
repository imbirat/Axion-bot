# Axion — All-in-One Discord Bot

Axion is a fully-featured Discord bot providing premium features for free. Built with Node.js v22, discord.js v14, and MongoDB.

## Features

- **Moderation** — Ban, kick, warn, mute, jail, lock, slowmode, clear
- **Anti-Nuke** — Protect your server from raids and mass destruction
- **Auto-Mod** — Anti-spam, anti-invite, anti-caps, bad word filter
- **Logging** — Track member joins/leaves, message edits/deletes, moderation actions
- **Welcome / Farewell** — Customizable join/leave messages with embeds
- **Leveling** — XP system with text, voice, and reaction earning
- **Economy** — Coins, banking, daily rewards, fishing, gambling, robbing
- **Giveaway** — Host giveaways with role and invite requirements
- **Ticket System** — Full support ticket system with transcripts
- **Verification** — Button, captcha, or reaction verification
- **Reaction Roles** — Button and reaction-based role assignment
- **Analytics** — Invite tracking, activity stats, server growth
- **Fun** — Memes, 8-ball, guess-the-number
- **Anime** — Anime, manga, character, waifu lookups via Jikan API
- **Social** — Confessions, truth or dare, matchmaking
- **AI** — Gemini 2.5 Flash powered asking and image generation
- **Starboard** — Highlight the best messages
- **Custom Commands** — Create your own trigger-response commands
- **Temp Voice Channels** — Join-to-create voice channel system
- **Counting** — Fun counting channel game
- **Bump Reminder** — Disboard bump reminders every 2 hours
- **Report System** — Anonymous user reporting system
- **Message Scheduler** — Schedule messages for later delivery
- **Server Stats** — Live voice channel statistics
- **Birthdays** — Birthday tracking and announcements
- **Quotes** — Save and recall memorable quotes
- **Advanced Polls** — Multi-option polls with time limits
- **Auto-Roles** — Automatic role assignment on join
- **AFK** — AFK status with auto-respond
- **Multi-Language** — English, Spanish, French, German, Portuguese

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your values
3. Run `npm install`
4. Run `npm start` or `npm run dev` for development

## Environment Variables

| Variable | Description |
|---|---|
| `DISCORD_TOKEN` | Your Discord bot token |
| `CLIENT_ID` | Your bot's client ID |
| `MONGO_URI` | MongoDB connection string |
| `GEMINI_API_KEY` | Google Gemini API key |
| `OWNER_ID` | Bot owner's Discord user ID |
| `SUPPORT_SERVER` | Support server invite link |
| `INVITE_URL` | Bot invite URL |

## Commands

Use `/help` in Discord to see all available commands.

## License

MIT
