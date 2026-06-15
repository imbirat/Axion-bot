# Axion Discord Bot

All-in-one Discord bot providing premium features for free.

## Features

- **Moderation** — Ban, kick, mute, warn, jail, lock, slowmode, clear
- **Economy** — Daily, work, fish, rob, bank, give, coinflip, leaderboard
- **Leveling** — XP system with text/voice/reaction earning
- **Giveaway** — Host giveaways with role/invite requirements
- **Ticket System** — Full support system with transcripts
- **Verification** — Button, captcha, or reaction verification
- **Welcome / Farewell** — Custom messages and embeds
- **Auto-Mod** — Anti-spam, anti-invite, anti-caps, bad word filter
- **Anti-Nuke** — Protect against raids and mass deletions
- **Starboard** — Highlight the best messages
- **Custom Commands** — Create your own commands
- **Temp Voice Channels** — Join-to-create voice channels
- **Counting** — Server counting game
- **Bump Reminder** — Get reminded to bump your server
- **Reports** — Anonymous user reporting system
- **Scheduler** — Schedule messages for later
- **Server Stats** — Live stats in voice channels
- **Reaction & Button Roles** — Self-assignable roles
- **Anime** — Anime, manga, character lookups, waifu
- **AI** — Gemini AI chat and image generation
- **Social** — Confessions, truth or dare, matchmaking
- **Quotes** — Save and recall memorable quotes
- **Birthdays** — Birthday tracking and announcements
- **Polls** — Advanced polls with time limits
- **And much more!**

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your values
3. Run `npm install`
4. Run `npm start`

## Requirements

- Node.js >= 22
- MongoDB instance

## Environment Variables

| Variable | Description |
|---|---|
| `DISCORD_TOKEN` | Your bot token from Discord Developer Portal |
| `CLIENT_ID` | Your bot's client ID |
| `MONGO_URI` | MongoDB connection string |
| `GEMINI_API_KEY` | Google Gemini API key (for AI features) |
| `OWNER_ID` | Discord user ID of the bot owner |
| `SUPPORT_SERVER` | Discord invite for support server |
| `INVITE_URL` | Bot invite URL |

## License

MIT
