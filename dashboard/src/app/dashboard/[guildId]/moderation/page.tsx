'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import TopBar from '@/components/dashboard/TopBar';
import SaveBar from '@/components/dashboard/SaveBar';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useParams } from 'next/navigation';
import ChannelSelect from '@/components/dashboard/ChannelSelect';
import { toast } from 'sonner';

export default function ModerationPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const [config, setConfig] = useState<any>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/guild/${guildId}/moderation`)
      .then((r) => r.json())
      .then((d) => setConfig(d));
  }, [guildId]);

  const update = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/guild/${guildId}/moderation`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (res.ok) { toast.success('Saved'); setDirty(false); }
    else toast.error('Failed to save');
    setSaving(false);
  };

  const discard = () => {
    fetch(`/api/guild/${guildId}/moderation`)
      .then((r) => r.json())
      .then((d) => { setConfig(d); setDirty(false); });
  };

  if (!config) return <div className="p-8 text-[var(--muted)]">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <TopBar title="Moderation" />
      <div className="p-6 max-w-3xl space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">General</h3>
          <div className="flex items-center justify-between">
            <div><Label>Mod Log Channel</Label><p className="text-xs text-[var(--muted)]">Channel for moderation logs</p></div>
            <div className="w-64">
              <ChannelSelect guildId={guildId} value={config.modLogChannel} onChange={(v) => update('modLogChannel', v)} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div><Label>Mention Spam Protection</Label><p className="text-xs text-[var(--muted)]">Auto-warn on excessive mentions</p></div>
            <Switch checked={config.mentionSpamProtection ?? true} onCheckedChange={(v) => update('mentionSpamProtection', v)} />
          </div>
          <div className="flex items-center justify-between">
            <div><Label>Max Mentions</Label><p className="text-xs text-[var(--muted)]">Before triggering protection</p></div>
            <Input type="number" value={config.maxMentions ?? 10} onChange={(e) => update('maxMentions', parseInt(e.target.value))} className="w-24" />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Punishment Defaults</h3>
          <div className="flex items-center justify-between">
            <div><Label>Default Warn Action</Label><p className="text-xs text-[var(--muted)]">Action after max warnings</p></div>
            <select value={config.defaultWarnAction || 'mute'} onChange={(e) => update('defaultWarnAction', e.target.value)} className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm">
              <option value="mute">Mute</option>
              <option value="kick">Kick</option>
              <option value="ban">Ban</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div><Label>Max Warnings</Label><p className="text-xs text-[var(--muted)]">Before automatic action</p></div>
            <Input type="number" value={config.maxWarnings ?? 3} onChange={(e) => update('maxWarnings', parseInt(e.target.value))} className="w-24" />
          </div>
        </Card>
      </div>
      <SaveBar isDirty={dirty} onSave={save} onDiscard={discard} isSaving={saving} />
    </motion.div>
  );
}
