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
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

export default function GiveawaysPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const [config, setConfig] = useState<any>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/guild/${guildId}/giveaways`)
      .then((r) => r.json())
      .then((d) => setConfig(d));
  }, [guildId]);

  const update = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/guild/${guildId}/giveaways`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config),
    });
    if (res.ok) { toast.success('Saved'); setDirty(false); } else toast.error('Failed to save');
    setSaving(false);
  };

  const discard = () => {
    fetch(`/api/guild/${guildId}/giveaways`)
      .then((r) => r.json())
      .then((d) => { setConfig(d); setDirty(false); });
  };

  if (!config) return <div className="p-8 text-[var(--muted)]">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <TopBar title="Giveaways" />
      <div className="p-6 max-w-3xl space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">General Settings</h3>
          <div className="flex items-center justify-between">
            <div><Label>Giveaway Command Enabled</Label><p className="text-xs text-[var(--muted)]">Allow staff to start giveaways</p></div>
            <Switch checked={config.enabled ?? true} onCheckedChange={(v) => update('enabled', v)} />
          </div>
          <div><Label>Default Giveaway Channel</Label></div>
          <div className="w-72"><ChannelSelect guildId={guildId} value={config.defaultChannel} onChange={(v) => update('defaultChannel', v)} /></div>
          <div><Label>Giveaway Manager Role</Label><p className="text-xs text-[var(--muted)]">Role allowed to manage giveaways</p></div>
          <div className="w-72"><RoleSelect guildId={guildId} value={config.managerRoleId} onChange={(v) => update('managerRoleId', v)} /></div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Defaults</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Default Duration (hours)</Label><Input type="number" value={config.defaultDuration ?? 24} onChange={(e) => update('defaultDuration', parseInt(e.target.value))} /></div>
            <div><Label>Default Winners</Label><Input type="number" value={config.defaultWinners ?? 1} onChange={(e) => update('defaultWinners', parseInt(e.target.value))} /></div>
          </div>
          <div className="flex items-center justify-between">
            <div><Label>Require Role to Enter</Label><p className="text-xs text-[var(--muted)]">Members must have a specific role to enter</p></div>
            <Switch checked={config.requireRole ?? false} onCheckedChange={(v) => update('requireRole', v)} />
          </div>
          {config.requireRole && (
            <RoleSelect guildId={guildId} value={config.requiredRoleId} onChange={(v) => update('requiredRoleId', v)} placeholder="Required role" />
          )}
        </Card>
      </div>
      <SaveBar isDirty={dirty} onSave={save} onDiscard={discard} isSaving={saving} />
    </motion.div>
  );
}
