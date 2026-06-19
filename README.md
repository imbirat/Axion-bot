# Axion

> All-in-one Discord bot with a modern web dashboard. Moderation, leveling, tickets, giveaways, auto-mod, anti-nuke, economy, AI chat, and more — completely free.

[![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933?logo=node.js)](https://nodejs.org)
[![Discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord)](https://discord.js.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js)](https://nextjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb)](https://mongodb.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## About

Axion is a feature-rich, open-source Discord bot designed to replace multiple paid bots with a single free solution. Every feature is built with performance and ease-of-use in mind.

The bot runs on **Node.js 22** with **discord.js v14** and stores all configuration in **MongoDB**. A companion **Next.js 15** web dashboard (see `dashboard/`) provides a graphical interface for managing server settings — no coding required.

### Why Axion?

- **All-in-one** — 100+ commands across 15+ categories, no paid tiers
- **Web dashboard** — Manage settings visually from any browser
- **Hybrid commands** — Every feature works with both slash (`/`) and prefix (`.` / `/`)
- **Self-hostable** — Full control over your data and uptime
- **Active development** — Regular updates and community-driven features

---

## Stack

### Bot

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 |
| Library | discord.js v14.18+ |
| Database | MongoDB via Mongoose |
| AI | Google Gemini API (multi-model fallback) |
| Image Gen | pollinations.ai |
| Host | Railway (recommended) |

### Web Dashboard

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Auth | NextAuth.js v5 (Discord OAuth2) |
| Database | MongoDB (shared with bot) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Animations | Framer Motion |
| Icons | Lucide React |
| Host | Vercel (recommended) |

---

## Features

### Moderation & Security
- Ban, kick, mute, warn, jail, lock, slowmode, purge
- Auto-moderation (spam, invites, caps, bad words, mass mentions)
- Anti-nuke (mass ban/kick/channel/role/webhook/bot protection)
- Server-wide audit logging with 12+ toggleable events

### Engagement
- **Leveling** — XP from messages, voice, reactions; configurable level rewards
- **Economy** — Daily, work, fish, rob, bank, give, coinflip, leaderboard
- **Giveaways** — Role-gated, invite-gated, multi-winner
- **Reaction & Button Roles** — Self-assignable roles via reactions or buttons
- **Starboard** — Highlight the best messages

### Support Tools
- **Ticket System** — Full support panel with categories, transcripts, close confirmation
- **Verification** — Button, CAPTCHA, or reaction-based verification
- **Custom Commands** — Create your own text/embed commands
- **Scheduler** — Schedule messages and reminders
- **Polls** — Advanced polls with time limits

### Fun & Social
- AI chat with Google Gemini (multi-model)
- AI image generation (pollinations.ai)
- Anime/manga/character lookups, waifu
- Confessions, truth or dare, matchmaking
- Quotes, birthdays, counting game, bump reminders

### Utility
- Server stats in voice channels, bot info, user info, role info
- Temp voice channels (join-to-create)
- Embed & container builders (slash and prefix)
- Notification alerts (Twitch, YouTube)

### Web Dashboard
- Server selection with Discord OAuth2
- 14 configuration pages covering every module
- Visual embed builder with live preview
- Reusable UI components (ChannelSelect, RoleSelect, embedded SaveBar)
- Real-time bot online status indicator

---

## Guide

### Prerequisites

- **Node.js** 22 or higher
- **MongoDB** instance (local or Atlas)
- **Discord Bot Token** from [Discord Developer Portal](https://discord.com/developers/applications)
- **Google Gemini API Key** (optional, for AI features)
- **Discord OAuth2 credentials** (optional, for web dashboard)

### Bot Setup

```bash
# 1. Clone the repository
git clone https://github.com/imbirat/Axion-bot.git
cd Axion-bot

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your values

# 4. Start the bot
npm start
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DISCORD_TOKEN` | Yes | Bot token from Discord Developer Portal |
| `CLIENT_ID` | Yes | Bot application client ID |
| `MONGO_URI` | Yes | MongoDB connection string |
| `OWNER_ID` | No | Discord user ID of bot owner |
| `GUILD_ID` | No | Guild ID for development (bypasses 100-command limit) |
| `GEMINI_API_KEY` | No | Google Gemini API key for AI features |
| `SUPPORT_SERVER` | No | Discord invite for support server |
| `INVITE_URL` | No | Bot invite URL |
| `TOPGG_TOKEN` | No | Top.gg API token |

### Dashboard Setup

```bash
# From the repository root
cd dashboard
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your values

# Required dashboard env vars:
#   DISCORD_CLIENT_ID     - Discord OAuth2 client ID
#   DISCORD_CLIENT_SECRET - Discord OAuth2 client secret
#   DISCORD_BOT_TOKEN     - Same bot token as above
#   MONGO_URI             - Same MongoDB URI as above
#   NEXTAUTH_SECRET       - Random string for session encryption
#   NEXTAUTH_URL          - Dashboard URL (http://localhost:3000 for dev)

# Start the dashboard
npm run dev
```

### Slash Command Registration

Commands register automatically on bot startup. Due to Discord's 100-command global limit, essential categories (Moderation, Config, Ticket, Utilities, Verification) are prioritized. The remaining commands work via prefix only.

To register all 118+ commands (no limit), set `GUILD_ID` in your `.env` to your development server ID.

### Bot Prefix

The bot uses `.` and `/` as prefixes. This is hardcoded — no runtime prefix configuration. Slash commands (`/`) work alongside prefix commands.

---

## Project Structure

```
Axion-bot/
├── src/
│   ├── commands/         # Command files (slash + prefix)
│   ├── components/       # Modals, buttons, select menus
│   ├── events/           # Discord event handlers
│   ├── handlers/         # Command/event registration
│   ├── models/           # Mongoose schemas
│   └── utils/            # Helpers, services, constants
├── dashboard/            # Next.js 15 web dashboard
│   └── src/
│       ├── app/          # App Router pages & API routes
│       ├── components/   # Dashboard UI components
│       └── lib/          # Auth, DB, Discord helpers, models
├── .env.example
├── package.json
└── README.md
```

---

## License

[MIT](LICENSE) © Birat

---

<p align="center">
  <b>Axion</b> — Premium features, zero cost.
</p>
