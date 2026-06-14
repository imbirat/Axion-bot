<p align="center">
  <img src="https://img.shields.io/badge/Axion-v1.0.0-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Axion"/>
  <br/>
  <img src="https://img.shields.io/github/license/imbirat/Axion-bot?style=flat-square"/>
  <img src="https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=nodedotjs"/>
  <img src="https://img.shields.io/badge/discord.js-v14-5865F2?style=flat-square&logo=discord"/>
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb"/>
  <img src="https://img.shields.io/badge/AI-Gemini_2.5_Flash-4285F4?style=flat-square&logo=google"/>
</p>

<h1 align="center">🤖 Axion — All-in-One Discord Bot</h1>
<p align="center"><i>Premium-grade features. Zero cost. Infinite possibilities.</i></p>
<p align="center">
  <a href="https://discord.gg/5ZGTMY6GRj">Support Server</a>
  ·
  <a href="https://discord.com/oauth2/authorize?client_id=1502623528476737627">Invite Bot</a>
  ·
  <a href="#-commands">Commands</a>
  ·
  <a href="#-self-hosting">Self-Hosting</a>
</p>

---

## ✨ Why Axion?

Axion is a fully-featured, self-hostable Discord bot designed to replace 5-10 premium bots with a single, zero-cost solution. Built for server admins who want full control over their moderation, engagement, and automation stack.

### What sets us apart

| Feature | Axion | Typical Free Bot | Premium Bot |
|---------|-------|-----------------|-------------|
| Price | **Free** | Free | $5–$15/mo |
| Full Moderation Suite | ✅ | Partial | ✅ |
| Ticket System w/ Transcripts | ✅ | ❌ | ✅ |
| AI (Gemini 2.5 Flash) | ✅ | ❌ | Usually extra |
| Anti-Nuke Protection | ✅ | ❌ | ✅ |
| Multi-Language (5 langs) | ✅ | ❌ | Usually ❌ |
| Starboard | ✅ | ❌ | ✅ |
| Custom Commands | ✅ | ✅ | ✅ |
| Reaction & Button Roles | ✅ | ✅ | ✅ |
| Self-Hostable (full control) | ✅ | ❌ | ❌ |
| No Paywall | ✅ | Usually limited | ❌ |

---

## 🚀 Quick Start (Self-Hosting)

```bash
# 1. Clone
git clone https://github.com/imbirat/Axion-bot.git
cd Axion-bot

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your tokens (see Configuration section)

# 4. Start
npm start           # Production
npm run dev         # Development (nodemon)
```

### Prerequisites

- **Node.js** v22.0.0 or higher
- **MongoDB** instance (local or Atlas)
- **Discord Application** created at [discord.dev](https://discord.dev)
- **Google Gemini API key** (for AI features)
- **YouTube Data API key** (optional, for notification features)
- **Twitch Client ID + Secret** (optional, for notification features)

---

## 🔧 Configuration

All configuration is done through environment variables. Copy `.env.example` to `.env`:

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_TOKEN` | ✅ | Your bot token from Discord Developer Portal |
| `CLIENT_ID` | ✅ | Application ID from Discord Developer Portal |
| `MONGO_URI` | ✅ | MongoDB connection string |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key (get from [aistudio.google.com](https://aistudio.google.com)) |
| `OWNER_ID` | ✅ | Your Discord user ID |
| `SUPPORT_SERVER` | ✅ | Discord invite for your support server |
| `INVITE_URL` | ✅ | OAuth2 URL for inviting the bot |
| `YOUTUBE_API_KEY` | ❌ | Required for `/notification youtube` |
| `TWITCH_CLIENT_ID` | ❌ | Required for `/notification twitch` |
| `TWITCH_CLIENT_SECRET` | ❌ | Required for `/notification twitch` |

---

## 📚 Commands

Axion ships with **105+ slash commands** across **24 categories**. Use `/help` in Discord to browse them interactively, or see the summary below.

### 🛡️ Moderation
`/ban` `/kick` `/warn` `/mute` `/unmute` `/jail` `/unjail` `/lock` `/unlock` `/slowmode` `/clear` `/nickname`

### 🛡️ Anti-Nuke
`/antinuke enable` `/antinuke disable` `/antinuke config`

### 📋 Logging
`/logging enable` `/logging disable` — Tracks joins, leaves, deletions, edits, moderation actions.

### 🤖 Auto-Mod
`/automod enable` `/automod disable` `/automod config` — Anti-spam, anti-invite, anti-caps, word filter.

### 👋 Welcome / Farewell
`/setchannel welcome|farewell|booster|leveling` `/setcustommessage` — Custom join/leave/boost messages with embeds.

### ⭐ Leveling
`/profile xp` `/leaderboard xp` `/addxp` `/removexp` — Earn XP through text, voice, and reactions.

### 💰 Economy
`/daily` `/work` `/fish` `/rob` `/coinflip` `/give` `/deposit` `/bank` `/profile economy` `/leaderboard economy`

### 🎉 Giveaway
`/giveaway start` `/giveaway end` `/giveaway reroll` — Role requirements, invite requirements, bonus entries.

### 🎫 Ticket System
`/ticketsetup` `/ticketclose` `/ticketclaim` `/ticketadd` `/ticketrename` `/tickettranscript` `/ticketstats` — Full lifecycle with HTML transcripts.

### ✅ Verification
`/verifysetup` `/verifymode` `/verify` `/unverify` `/verifyall` — Button, captcha, or reaction modes.

### 🔁 Reaction Roles
`/reactionrole create` `/buttonrole create`

### 📊 Analytics
`/invites` `/activity` `/serverstats`

### 🎮 Fun
`/8ball` `/meme` `/guessnumber`

### 🎌 Anime
`/anime` `/manga` `/character` `/waifu` `/animequote` `/animerandom` `/movierecommend` — Powered by Jikan API.

### 💬 Social
`/confess` `/truth` `/dare` `/matchmaking` `/dailyquestion`

### 🧠 AI
`/ask` `/createimage` — Powered by Google Gemini 2.5 Flash.

### 🔧 Utilities
`/ping` `/botinfo` `/serverinfo` `/userinfo` `/avatar` `/banner` `/snipe` `/reminder` `/membercount` `/poll` `/giverole` `/roleall`

### ⚙️ Config
`/setprefix` `/setchannel` `/setcustommessage` `/setlanguage` (EN/ES/FR/DE/PT)

### 🎂 Birthday
`/birthday set` `/birthday check` `/birthday list`

### 💭 Quotes
`/quote add` `/quote random` `/quote list`

### 📌 Sticky Messages
`/sticky set` `/sticky remove`

### 📣 Advanced Polls
`/advancedpoll create` `/advancedpoll end` `/advancedpoll results`

### 👤 Auto-Roles
`/autorole add` `/autorole remove` `/autorole list`

### 🌙 AFK
`/afk` `/afkend` — Auto-responds on mention, auto-removes on message.

### ⭐ Starboard
`/starboard setup` `/starboard config` `/starboard disable` — Configurable emoji + threshold.

### 🔧 Custom Commands
`/customcmd add` `/customcmd edit` `/customcmd remove` `/customcmd list`

### 🕐 Temp Voice Channels
`/tempvc setup` `/tempvc config` — Join-to-create voice channels.

### 🔢 Counting
`/counting setup` `/counting stats` `/counting reset` — Milestone celebrations.

### 📣 Bump Reminder
`/bumper setup` `/bumper disable` — 2-hour Disboard bump reminders.

### 📋 Reports
`/report` `/reports view` `/reportsetup` — Anonymous reporting with mod panel.

### 📅 Message Scheduler
`/schedule` `/schedule list` `/schedule cancel` — Schedule messages for later delivery.

### 📊 Server Stats
`/serverstats setup` `/serverstats add` `/serverstats remove` — Live voice channel stats.

### 🔔 Notifications
`/notification youtube add|remove|list` `/notification twitch add|remove|list` — YouTube & Twitch content alerts (5-min polling).

---

## ☁️ Deployment

### Railway (recommended)

The project includes a `railway.toml` — just connect your GitHub repo to Railway, add the environment variables, and deploy.

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "node src/index.js"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10
```

### Docker (coming soon)

---

## 🏗️ Architecture

```
axion/
├── src/
│   ├── commands/       # 30+ command categories (140 files)
│   ├── components/     # Button, menu, modal interaction handlers
│   ├── events/         # Discord gateway event listeners
│   ├── handlers/       # Auto-loaders for commands, events, components
│   ├── locales/        # i18n translations (EN, ES, FR, DE, PT)
│   ├── models/         # Mongoose schemas (17 models)
│   ├── services/       # Business logic (13 services)
│   └── utils/          # Helpers (embeds, formatters, permissions, etc.)
├── .env.example
├── package.json
└── railway.toml
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js v22 |
| Library | discord.js v14.18 (Components v2) |
| Database | MongoDB via Mongoose |
| AI | Google Gemini 2.5 Flash |
| Scheduler | node-cron |
| HTTP | axios |
| Logger | chalk |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/imbirat">imbirat</a>
  <br/>
  <a href="https://discord.gg/5ZGTMY6GRj">Join our Discord</a>
  ·
  <a href="https://discord.com/oauth2/authorize?client_id=1502623528476737627">Invite Axion</a>
</p>
