# Axion Dashboard

> Web dashboard for the Axion Discord bot. Manage moderation, leveling, tickets, giveaways, auto-mod, and more from a beautiful interface.

Built with **Next.js 15** (App Router), **TypeScript** (strict), **Tailwind CSS v4**, **shadcn/ui**, and **Framer Motion**.

## Requirements

- **Node.js** 22+
- **MongoDB** (shared with the Axion bot)
- **Discord OAuth2** credentials

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

### Required Environment Variables

| Variable | Description |
|---|---|
| `DISCORD_CLIENT_ID` | Discord OAuth2 client ID |
| `DISCORD_CLIENT_SECRET` | Discord OAuth2 client secret |
| `DISCORD_BOT_TOKEN` | Axion bot token |
| `MONGO_URI` | MongoDB connection string (same as bot) |
| `NEXTAUTH_SECRET` | Random string for session encryption |
| `NEXTAUTH_URL` | Dashboard URL (e.g. `http://localhost:3000`) |

## Deployment

Recommended: **Vercel** (single command deploy).

```bash
npm run build
```

Make sure all environment variables are set in your hosting dashboard.

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | Discord OAuth2 sign-in |
| `/servers` | Server selection |
| `/dashboard/[guildId]` | Server overview & stats |
| `/dashboard/[guildId]/bot-settings` | General bot config |
| `/dashboard/[guildId]/moderation` | Moderation settings |
| `/dashboard/[guildId]/automod` | Auto-moderation filters |
| `/dashboard/[guildId]/antinuke` | Anti-nuke protection |
| `/dashboard/[guildId]/leveling` | XP & level rewards |
| `/dashboard/[guildId]/greetings` | Welcome/goodbye messages |
| `/dashboard/[guildId]/tickets` | Ticket system config |
| `/dashboard/[guildId]/giveaways` | Giveaway defaults |
| `/dashboard/[guildId]/reaction-roles` | Reaction role mappings |
| `/dashboard/[guildId]/verification` | Verification settings |
| `/dashboard/[guildId]/logging` | Audit log events |
| `/dashboard/[guildId]/embed-builder` | Visual embed creator |
| `/dashboard/[guildId]/notifications` | Twitch/YouTube alerts |
| `/dashboard/[guildId]/autoroles` | Auto-role assignment |

## Architecture

- **Auth**: NextAuth.js v5 with Discord OAuth2 (`identify guilds` scopes)
- **API**: Next.js API routes with server-side Discord API calls using bot token
- **Database**: Mongoose models shared with the bot (same `MONGO_URI`)
- **Styling**: Tailwind CSS v4 with custom CSS variables, dark theme only
- **Components**: shadcn/ui primitives + custom reusable components (ChannelSelect, RoleSelect, SaveBar, EmbedPreview, Sidebar, TopBar)

## License

MIT
