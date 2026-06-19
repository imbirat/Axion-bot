const DISCORD_API = 'https://discord.com/api/v10';

async function fetchDiscord(path: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bot ${token}`;
  const res = await fetch(`${DISCORD_API}${path}`, { headers });
  if (!res.ok) throw new Error(`Discord API error: ${res.status}`);
  return res.json();
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  approximate_member_count?: number;
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: number;
}

export interface DiscordRole {
  id: string;
  name: string;
  color: number;
}

export async function getUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
  const res = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch guilds');
  return res.json();
}

export async function getGuildChannels(guildId: string): Promise<DiscordChannel[]> {
  return fetchDiscord(`/guilds/${guildId}/channels`, process.env.DISCORD_BOT_TOKEN);
}

export async function getGuildRoles(guildId: string): Promise<DiscordRole[]> {
  return fetchDiscord(`/guilds/${guildId}/roles`, process.env.DISCORD_BOT_TOKEN);
}

export async function getGuild(guildId: string) {
  return fetchDiscord(`/guilds/${guildId}`, process.env.DISCORD_BOT_TOKEN);
}

export async function getGuildMember(guildId: string, userId: string) {
  return fetchDiscord(`/guilds/${guildId}/members/${userId}`, process.env.DISCORD_BOT_TOKEN);
}

export function hasManageServer(permissions: string): boolean {
  const perms = BigInt(permissions);
  const MANAGE_GUILD = 0x20n;
  const ADMINISTRATOR = 0x8n;
  return (perms & (MANAGE_GUILD | ADMINISTRATOR)) !== 0n;
}

export async function sendDiscordMessage(channelId: string, body: object) {
  const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Failed to send message: ${res.status}`);
  return res.json();
}
