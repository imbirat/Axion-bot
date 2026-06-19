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
import { Textarea } from '@/components/ui/textarea';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

export default function VerificationPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const [config, setConfig] = useState<any>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/guild/${guildId}/verification`)
      .then((r) => r.json())
      .then((d) => setConfig(d));
  }, [guildId]);

  const update = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/guild/${guildId}/verification`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config),
    });
    if (res.ok) { toast.success('Saved'); setDirty(false); } else toast.error('Failed to save');
    setSaving(false);
  };

  const discard = () => {
    fetch(`/api/guild/${guildId}/verification`)
      .then((r) => r.json())
      .then((d) => { setConfig(d); setDirty(false); });
  };

  if (!config) return <div className="p-8 text-[var(--muted)]">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <TopBar title="Verification System" />
      <div className="p-6 max-w-3xl space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">General</h3>
          <div className="flex items-center justify-between">
            <div><Label>Verification Enabled</Label><p className="text-xs text-[var(--muted)]">Require users to verify before accessing the server</p></div>
            <Switch checked={config.enabled ?? false} onCheckedChange={(v) => update('enabled', v)} />
          </div>
          <div>
            <Label>Verification Type</Label>
            <select value={config.type || 'button'} onChange={(e) => update('type', e.target.value)} className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm">
              <option value="button">Button Click</option>
              <option value="captcha">CAPTCHA</option>
            </select>
          </div>
          <div>
            <Label>Verified Role</Label>
            <RoleSelect guildId={guildId} value={config.verifiedRoleId} onChange={(v) => update('verifiedRoleId', v)} />
          </div>
          <div>
            <Label>Unverified Role</Label>
            <RoleSelect guildId={guildId} value={config.unverifiedRoleId} onChange={(v) => update('unverifiedRoleId', v)} placeholder="Assign on join (optional)" />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Verification Channel</h3>
          <div>
            <Label>Verification Channel</Label>
            <ChannelSelect guildId={guildId} value={config.channelId} onChange={(v) => update('channelId', v)} />
          </div>
          <div>
            <Label>Verification Message</Label>
            <Textarea value={config.message || ''} onChange={(e) => update('message', e.target.value)} rows={4} placeholder="Click the button below to verify!" />
          </div>
        </Card>
      </div>
      <SaveBar isDirty={dirty} onSave={save} onDiscard={discard} isSaving={saving} />
    </motion.div>
  );
}
