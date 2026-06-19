'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import TopBar from '@/components/dashboard/TopBar';
import SaveBar from '@/components/dashboard/SaveBar';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

export default function AntinukePage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const [config, setConfig] = useState<any>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/guild/${guildId}/antinuke`)
      .then((r) => r.json())
      .then((d) => setConfig(d));
  }, [guildId]);

  const update = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/guild/${guildId}/antinuke`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config),
    });
    if (res.ok) { toast.success('Saved'); setDirty(false); } else toast.error('Failed to save');
    setSaving(false);
  };

  const discard = () => {
    fetch(`/api/guild/${guildId}/antinuke`)
      .then((r) => r.json())
      .then((d) => { setConfig(d); setDirty(false); });
  };

  if (!config) return <div className="p-8 text-[var(--muted)]">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <TopBar title="Anti-Nuke Protection" />
      <div className="p-6 max-w-3xl space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Protection Modules</h3>
          {[
            { key: 'banProtection', label: 'Mass Ban Protection', desc: 'Detect and block mass bans' },
            { key: 'kickProtection', label: 'Mass Kick Protection', desc: 'Detect and block mass kicks' },
            { key: 'channelProtection', label: 'Channel Deletion Protection', desc: 'Detect and block mass channel deletes' },
            { key: 'roleProtection', label: 'Role Deletion Protection', desc: 'Detect and block mass role deletes' },
            { key: 'webhookProtection', label: 'Webhook Spam Protection', desc: 'Detect and block webhook abuse' },
            { key: 'botProtection', label: 'Bot Add Protection', desc: 'Block unauthorized bot additions' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div><Label>{label}</Label><p className="text-xs text-[var(--muted)]">{desc}</p></div>
              <Switch checked={(config as any)[key] ?? false} onCheckedChange={(v) => update(key, v)} />
            </div>
          ))}
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Thresholds</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Max Actions / 10s</Label>
              <Input type="number" value={config.maxActions ?? 5} onChange={(e) => update('maxActions', parseInt(e.target.value))} />
            </div>
            <div>
              <Label>Punishment</Label>
              <select value={config.punishment || 'ban'} onChange={(e) => update('punishment', e.target.value)} className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm">
                <option value="ban">Ban</option>
                <option value="kick">Kick</option>
                <option value="mute">Mute</option>
              </select>
            </div>
          </div>
        </Card>
      </div>
      <SaveBar isDirty={dirty} onSave={save} onDiscard={discard} isSaving={saving} />
    </motion.div>
  );
}
