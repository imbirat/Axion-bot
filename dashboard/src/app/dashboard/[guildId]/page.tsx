'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import TopBar from '@/components/dashboard/TopBar';
import { Card } from '@/components/ui/card';
import { Users, Shield, Star, Ticket, TrendingUp, Activity } from 'lucide-react';

export default function GuildOverviewPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const [guild, setGuild] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/discord/guild/${guildId}`)
      .then((r) => r.json())
      .then((d) => setGuild(d));
    fetch(`/api/guild/${guildId}/config`)
      .then((r) => r.json())
      .then((d) => setConfig(d));
  }, [guildId]);

  const stats = [
    { icon: Users, label: 'Members', value: guild?.approximate_member_count?.toLocaleString() || '—' },
    { icon: Shield, label: 'Moderation', value: config?.modLogChannel ? 'Configured' : 'Not set', color: config?.modLogChannel ? 'text-[var(--success)]' : 'text-[var(--muted)]' },
    { icon: Star, label: 'Reaction Roles', value: config?.reactionRoles?.length ? `${config.reactionRoles.length} roles` : 'Not set' },
    { icon: Ticket, label: 'Tickets', value: config?.ticketsEnabled ? 'Enabled' : 'Disabled', color: config?.ticketsEnabled ? 'text-[var(--success)]' : 'text-[var(--muted)]' },
    { icon: TrendingUp, label: 'Leveling', value: config?.levelingEnabled ? 'Enabled' : 'Disabled', color: config?.levelingEnabled ? 'text-[var(--success)]' : 'text-[var(--muted)]' },
    { icon: Activity, label: 'Auto-Mod', value: config?.spamFilter ? 'Active' : 'Inactive', color: config?.spamFilter ? 'text-[var(--success)]' : 'text-[var(--muted)]' },
  ];

  const enabledCount = stats.filter((s) => s.color === 'text-[var(--success)]').length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <TopBar title="Overview" guildName={guild?.name} />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          {guild?.icon && (
            <img src={`https://cdn.discordapp.com/icons/${guildId}/${guild.icon}.png?size=128`} alt="" className="w-16 h-16 rounded-full" />
          )}
          <div>
            <h2 className="text-2xl font-bold">{guild?.name || 'Server'}</h2>
            <p className="text-[var(--muted)]">Server ID: {guildId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map(({ icon: Icon, label, value, color }) => (
            <Card key={label} className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <Icon className="h-4 w-4" />
                <span className="text-sm">{label}</span>
              </div>
              <p className={`text-lg font-semibold ${color || ''}`}>{value}</p>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button className="p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--card)] transition-colors text-left text-sm font-medium"
              onClick={() => window.location.href = `/dashboard/${guildId}/moderation`}>
              Configure Moderation
            </button>
            <button className="p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--card)] transition-colors text-left text-sm font-medium"
              onClick={() => window.location.href = `/dashboard/${guildId}/leveling`}>
              Setup Leveling
            </button>
            <button className="p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--card)] transition-colors text-left text-sm font-medium"
              onClick={() => window.location.href = `/dashboard/${guildId}/tickets`}>
              Enable Tickets
            </button>
            <button className="p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--card)] transition-colors text-left text-sm font-medium"
              onClick={() => window.location.href = `/dashboard/${guildId}/greetings`}>
              Welcome Messages
            </button>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
