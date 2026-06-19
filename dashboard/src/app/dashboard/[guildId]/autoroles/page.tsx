'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import TopBar from '@/components/dashboard/TopBar';
import SaveBar from '@/components/dashboard/SaveBar';
import RoleSelect from '@/components/dashboard/RoleSelect';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

export default function AutoRolesPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const [config, setConfig] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newRoleId, setNewRoleId] = useState('');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    fetch(`/api/guild/${guildId}/autoroles`)
      .then((r) => r.json())
      .then((data) => {
        setConfig(Array.isArray(data.roles) ? data.roles : []);
        setEnabled(data.enabled ?? false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [guildId]);

  const addRole = () => {
    if (!newRoleId || config.includes(newRoleId)) return;
    setConfig((prev) => [...prev, newRoleId]);
    setNewRoleId('');
    setDirty(true);
  };

  const removeRole = (roleId: string) => {
    setConfig((prev) => prev.filter((r) => r !== roleId));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/guild/${guildId}/autoroles`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roles: config, enabled }),
    });
    if (res.ok) { toast.success('Saved'); setDirty(false); } else toast.error('Failed to save');
    setSaving(false);
  };

  const discard = () => {
    fetch(`/api/guild/${guildId}/autoroles`)
      .then((r) => r.json())
      .then((data) => {
        setConfig(Array.isArray(data.roles) ? data.roles : []);
        setEnabled(data.enabled ?? false);
        setDirty(false);
      });
  };

  if (loading) return <div className="p-8 text-[var(--muted)]">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <TopBar title="Auto Roles" />
      <div className="p-6 max-w-3xl space-y-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div><Label>Auto Roles Enabled</Label><p className="text-xs text-[var(--muted)]">Automatically assign roles when members join</p></div>
            <Switch checked={enabled} onCheckedChange={(v) => { setEnabled(v); setDirty(true); }} />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Roles to Assign</h3>
          <p className="text-xs text-[var(--muted)]">These roles will be automatically assigned to new members</p>
          {config.length > 0 && (
            <div className="space-y-2">
              {config.map((roleId) => (
                <div key={roleId} className="flex items-center justify-between px-3 py-2 rounded-md bg-[var(--card)]">
                  <span className="text-sm text-[var(--muted)]">Role ID: {roleId}</span>
                  <button onClick={() => removeRole(roleId)} className="text-[var(--danger)] hover:opacity-70"><X className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          )}
          {config.length === 0 && <p className="text-sm text-[var(--muted)]">No auto roles configured</p>}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label>Add Role</Label>
              <RoleSelect guildId={guildId} value={newRoleId} onChange={(v) => setNewRoleId(v || '')} />
            </div>
            <Button onClick={addRole} variant="outline" className="mb-0.5"><Plus className="h-4 w-4" /></Button>
          </div>
        </Card>
      </div>
      <SaveBar isDirty={dirty} onSave={save} onDiscard={discard} isSaving={saving} />
    </motion.div>
  );
}
