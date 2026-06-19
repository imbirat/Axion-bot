'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import TopBar from '@/components/dashboard/TopBar';
import SaveBar from '@/components/dashboard/SaveBar';
import ChannelSelect from '@/components/dashboard/ChannelSelect';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

export default function GreetingsPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const [config, setConfig] = useState<any>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/guild/${guildId}/greetings`)
      .then((r) => r.json())
      .then((d) => setConfig(d));
  }, [guildId]);

  const update = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/guild/${guildId}/greetings`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config),
    });
    if (res.ok) { toast.success('Saved'); setDirty(false); } else toast.error('Failed to save');
    setSaving(false);
  };

  const discard = () => {
    fetch(`/api/guild/${guildId}/greetings`)
      .then((r) => r.json())
      .then((d) => { setConfig(d); setDirty(false); });
  };

  if (!config) return <div className="p-8 text-[var(--muted)]">Loading...</div>;

  const vars = [
    '{user}', '{user:mention}', '{server}', '{membercount}',
    '{user:tag}', '{user:id}',
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <TopBar title="Greetings" />
      <div className="p-6 max-w-3xl space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Welcome Settings</h3>
          <div className="flex items-center justify-between">
            <div><Label>Welcome Messages</Label><p className="text-xs text-[var(--muted)]">Send a welcome message when a new member joins</p></div>
            <Switch checked={config.welcomeEnabled ?? false} onCheckedChange={(v) => update('welcomeEnabled', v)} />
          </div>
          <div><Label>Welcome Channel</Label><ChannelSelect guildId={guildId} value={config.welcomeChannel} onChange={(v) => update('welcomeChannel', v)} /></div>
          <div>
            <Label>Welcome Message</Label>
            <Textarea value={config.welcomeMessage || ''} onChange={(e) => update('welcomeMessage', e.target.value)} rows={4} placeholder="Welcome {user:mention} to {server}!" />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Goodbye Settings</h3>
          <div className="flex items-center justify-between">
            <div><Label>Goodbye Messages</Label><p className="text-xs text-[var(--muted)]">Send a message when a member leaves</p></div>
            <Switch checked={config.goodbyeEnabled ?? false} onCheckedChange={(v) => update('goodbyeEnabled', v)} />
          </div>
          <div><Label>Goodbye Channel</Label><ChannelSelect guildId={guildId} value={config.goodbyeChannel} onChange={(v) => update('goodbyeChannel', v)} /></div>
          <div>
            <Label>Goodbye Message</Label>
            <Textarea value={config.goodbyeMessage || ''} onChange={(e) => update('goodbyeMessage', e.target.value)} rows={4} placeholder="Goodbye {user:tag}!" />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">Available Variables</h3>
          <div className="flex flex-wrap gap-2">
            {vars.map((v) => (
              <code key={v} className="px-2 py-1 rounded bg-[var(--card)] text-sm text-[var(--primary)]">{v}</code>
            ))}
          </div>
        </Card>
      </div>
      <SaveBar isDirty={dirty} onSave={save} onDiscard={discard} isSaving={saving} />
    </motion.div>
  );
}
