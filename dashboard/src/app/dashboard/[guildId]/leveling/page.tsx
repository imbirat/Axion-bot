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

export default function LevelingPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const [config, setConfig] = useState<any>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newReward, setNewReward] = useState({ level: 0, roleId: '' });

  useEffect(() => {
    fetch(`/api/guild/${guildId}/leveling`)
      .then((r) => r.json())
      .then((d) => setConfig(d));
  }, [guildId]);

  const update = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const addReward = () => {
    if (!newReward.roleId || newReward.level < 1) return;
    const rewards = config?.levelRewards || [];
    if (rewards.find((r: any) => r.level === newReward.level)) return;
    update('levelRewards', [...rewards, { ...newReward, roleId: newReward.roleId }]);
    setNewReward({ level: 0, roleId: '' });
  };

  const removeReward = (level: number) => {
    update('levelRewards', (config?.levelRewards || []).filter((r: any) => r.level !== level));
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/guild/${guildId}/leveling`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config),
    });
    if (res.ok) { toast.success('Saved'); setDirty(false); } else toast.error('Failed to save');
    setSaving(false);
  };

  const discard = () => {
    fetch(`/api/guild/${guildId}/leveling`)
      .then((r) => r.json())
      .then((d) => { setConfig(d); setDirty(false); });
  };

  if (!config) return <div className="p-8 text-[var(--muted)]">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <TopBar title="Leveling System" />
      <div className="p-6 max-w-3xl space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">General Settings</h3>
          <div className="flex items-center justify-between">
            <div><Label>Leveling Enabled</Label><p className="text-xs text-[var(--muted)]">Award XP for messages</p></div>
            <Switch checked={config.enabled ?? true} onCheckedChange={(v) => update('enabled', v)} />
          </div>
          <div className="flex items-center justify-between">
            <div><Label>Level Up Announcement</Label><p className="text-xs text-[var(--muted)]">Post a message when someone levels up</p></div>
            <Switch checked={config.announceLevelUp ?? true} onCheckedChange={(v) => update('announceLevelUp', v)} />
          </div>
          <div className="flex items-center justify-between">
            <div><Label>Announcement Channel</Label></div>
            <div className="w-72"><ChannelSelect guildId={guildId} value={config.announceChannel} onChange={(v) => update('announceChannel', v)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>XP per Message</Label><Input type="number" value={config.xpPerMessage ?? 15} onChange={(e) => update('xpPerMessage', parseInt(e.target.value))} /></div>
            <div><Label>XP Cooldown (seconds)</Label><Input type="number" value={config.xpCooldown ?? 60} onChange={(e) => update('xpCooldown', parseInt(e.target.value))} /></div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Level Rewards</h3>
          <p className="text-xs text-[var(--muted)]">Automatically assign roles when members reach certain levels</p>
          <div className="flex gap-2 items-end">
            <div className="w-24"><Label>Level</Label><Input type="number" value={newReward.level || ''} onChange={(e) => setNewReward({ ...newReward, level: parseInt(e.target.value) || 0 })} /></div>
            <div className="flex-1"><Label>Role</Label><RoleSelect guildId={guildId} value={newReward.roleId} onChange={(v) => setNewReward({ ...newReward, roleId: v || '' })} /></div>
            <Button onClick={addReward} variant="outline" className="mb-0.5">Add</Button>
          </div>
          <div className="space-y-2">
            {(config.levelRewards || []).length === 0 && <p className="text-sm text-[var(--muted)]">No level rewards configured</p>}
            {(config.levelRewards || []).sort((a: any, b: any) => a.level - b.level).map((r: any) => (
              <div key={r.level} className="flex items-center justify-between px-3 py-2 rounded-md bg-[var(--card)]">
                <span className="text-sm">Level <strong>{r.level}</strong></span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--muted)]">Role ID: {r.roleId}</span>
                  <button onClick={() => removeReward(r.level)} className="text-[var(--danger)] hover:opacity-70"><X className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <SaveBar isDirty={dirty} onSave={save} onDiscard={discard} isSaving={saving} />
    </motion.div>
  );
}
