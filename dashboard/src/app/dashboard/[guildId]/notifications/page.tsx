'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import TopBar from '@/components/dashboard/TopBar';
import SaveBar from '@/components/dashboard/SaveBar';
import ChannelSelect from '@/components/dashboard/ChannelSelect';
import RoleSelect from '@/components/dashboard/RoleSelect';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

interface Notification {
  event: string;
  message: string;
  channelId?: string;
  roleId?: string;
}

export default function NotificationsPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const [config, setConfig] = useState<any>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/guild/${guildId}/notifications`)
      .then((r) => r.json())
      .then((d) => setConfig(d));
  }, [guildId]);

  const update = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/guild/${guildId}/notifications`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config),
    });
    if (res.ok) { toast.success('Saved'); setDirty(false); } else toast.error('Failed to save');
    setSaving(false);
  };

  const discard = () => {
    fetch(`/api/guild/${guildId}/notifications`)
      .then((r) => r.json())
      .then((d) => { setConfig(d); setDirty(false); });
  };

  if (!config) return <div className="p-8 text-[var(--muted)]">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <TopBar title="Notifications" />
      <div className="p-6 max-w-3xl space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Twitch Notifications</h3>
          <div className="flex items-center justify-between">
            <div><Label>Twitch Alerts</Label><p className="text-xs text-[var(--muted)]">Notify when a streamer goes live</p></div>
            <Switch checked={config.twitchEnabled ?? false} onCheckedChange={(v) => update('twitchEnabled', v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Twitch Channel</Label><ChannelSelect guildId={guildId} value={config.twitchChannelId} onChange={(v) => update('twitchChannelId', v)} /></div>
            <div><Label>Ping Role</Label><RoleSelect guildId={guildId} value={config.twitchPingRoleId} onChange={(v) => update('twitchPingRoleId', v)} /></div>
          </div>
          <div><Label>Twitch Streamers (comma separated)</Label><Input value={config.twitchStreamers || ''} onChange={(e) => update('twitchStreamers', e.target.value)} placeholder="streamer1, streamer2" /></div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">YouTube Notifications</h3>
          <div className="flex items-center justify-between">
            <div><Label>YouTube Alerts</Label><p className="text-xs text-[var(--muted)]">Notify when a new video is posted</p></div>
            <Switch checked={config.youtubeEnabled ?? false} onCheckedChange={(v) => update('youtubeEnabled', v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>YouTube Channel</Label><ChannelSelect guildId={guildId} value={config.youtubeChannelId} onChange={(v) => update('youtubeChannelId', v)} /></div>
            <div><Label>Ping Role</Label><RoleSelect guildId={guildId} value={config.youtubePingRoleId} onChange={(v) => update('youtubePingRoleId', v)} /></div>
          </div>
          <div><Label>YouTube Channel IDs (comma separated)</Label><Input value={config.youtubeChannelIds || ''} onChange={(e) => update('youtubeChannelIds', e.target.value)} placeholder="UC_xxx, UC_yyy" /></div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Server Update Alerts</h3>
          <div className="flex items-center justify-between">
            <div><Label>Server Update Notifications</Label><p className="text-xs text-[var(--muted)]">Notify on server changes (boosts, name changes)</p></div>
            <Switch checked={config.serverUpdates ?? false} onCheckedChange={(v) => update('serverUpdates', v)} />
          </div>
        </Card>
      </div>
      <SaveBar isDirty={dirty} onSave={save} onDiscard={discard} isSaving={saving} />
    </motion.div>
  );
}
