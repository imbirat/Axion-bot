'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import TopBar from '@/components/dashboard/TopBar';
import SaveBar from '@/components/dashboard/SaveBar';
import ChannelSelect from '@/components/dashboard/ChannelSelect';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

const logEvents = [
  { key: 'messageDelete', label: 'Message Delete', desc: 'Log when messages are deleted' },
  { key: 'messageUpdate', label: 'Message Edit', desc: 'Log when messages are edited' },
  { key: 'memberJoin', label: 'Member Join', desc: 'Log when members join' },
  { key: 'memberLeave', label: 'Member Leave', desc: 'Log when members leave' },
  { key: 'memberBan', label: 'Member Ban', desc: 'Log when members are banned' },
  { key: 'memberUnban', label: 'Member Unban', desc: 'Log when members are unbanned' },
  { key: 'channelCreate', label: 'Channel Create', desc: 'Log when channels are created' },
  { key: 'channelDelete', label: 'Channel Delete', desc: 'Log when channels are deleted' },
  { key: 'roleCreate', label: 'Role Create', desc: 'Log when roles are created' },
  { key: 'roleDelete', label: 'Role Delete', desc: 'Log when roles are deleted' },
  { key: 'voiceStateUpdate', label: 'Voice State', desc: 'Log voice channel changes' },
  { key: 'guildBoost', label: 'Server Boost', desc: 'Log when members boost the server' },
];

export default function LoggingPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const [config, setConfig] = useState<any>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/guild/${guildId}/logging`)
      .then((r) => r.json())
      .then((d) => setConfig(d));
  }, [guildId]);

  const update = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/guild/${guildId}/logging`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config),
    });
    if (res.ok) { toast.success('Saved'); setDirty(false); } else toast.error('Failed to save');
    setSaving(false);
  };

  const discard = () => {
    fetch(`/api/guild/${guildId}/logging`)
      .then((r) => r.json())
      .then((d) => { setConfig(d); setDirty(false); });
  };

  if (!config) return <div className="p-8 text-[var(--muted)]">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <TopBar title="Audit Logging" />
      <div className="p-6 max-w-3xl space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Log Channel</h3>
          <div><ChannelSelect guildId={guildId} value={config.channelId} onChange={(v) => update('channelId', v)} /></div>
          <div className="flex items-center justify-between">
            <div><Label>Logging Enabled</Label><p className="text-xs text-[var(--muted)]">Master toggle for all logging</p></div>
            <Switch checked={config.enabled ?? true} onCheckedChange={(v) => update('enabled', v)} />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Events</h3>
          <p className="text-xs text-[var(--muted)]">Toggle individual logging events</p>
          <div className="grid gap-3">
            {logEvents.map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div><Label className="text-sm">{label}</Label><p className="text-xs text-[var(--muted)]">{desc}</p></div>
                <Switch checked={(config as any)[key] ?? false} onCheckedChange={(v) => update(key, v)} />
              </div>
            ))}
          </div>
        </Card>
      </div>
      <SaveBar isDirty={dirty} onSave={save} onDiscard={discard} isSaving={saving} />
    </motion.div>
  );
}
