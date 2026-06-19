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

export default function TicketsPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const [config, setConfig] = useState<any>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/guild/${guildId}/tickets`)
      .then((r) => r.json())
      .then((d) => setConfig(d));
  }, [guildId]);

  const update = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/guild/${guildId}/tickets`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config),
    });
    if (res.ok) { toast.success('Saved'); setDirty(false); } else toast.error('Failed to save');
    setSaving(false);
  };

  const discard = () => {
    fetch(`/api/guild/${guildId}/tickets`)
      .then((r) => r.json())
      .then((d) => { setConfig(d); setDirty(false); });
  };

  if (!config) return <div className="p-8 text-[var(--muted)]">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <TopBar title="Ticket System" />
      <div className="p-6 max-w-3xl space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">General</h3>
          <div className="flex items-center justify-between">
            <div><Label>Tickets Enabled</Label><p className="text-xs text-[var(--muted)]">Allow users to create support tickets</p></div>
            <Switch checked={config.enabled ?? false} onCheckedChange={(v) => update('enabled', v)} />
          </div>
          <div><Label>Ticket Category</Label><p className="text-xs text-[var(--muted)]">Category where ticket channels are created</p></div>
          <div className="w-72"><ChannelSelect guildId={guildId} value={config.categoryId} onChange={(v) => update('categoryId', v)} includeCategories /></div>
          <div><Label>Support Team Role</Label><p className="text-xs text-[var(--muted)]">Role with access to all tickets</p></div>
          <div className="w-72"><RoleSelect guildId={guildId} value={config.supportRoleId} onChange={(v) => update('supportRoleId', v)} /></div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Ticket Message</h3>
          <div><Label>Ticket Panel Message</Label><p className="text-xs text-[var(--muted)]">Message sent when a ticket is created</p></div>
          <Textarea value={config.ticketMessage || ''} onChange={(e) => update('ticketMessage', e.target.value)} rows={4} placeholder="Thank you for creating a ticket. Support will be with you shortly." />
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Limits</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Max Open Tickets / User</Label><Input type="number" value={config.maxTicketsPerUser ?? 3} onChange={(e) => update('maxTicketsPerUser', parseInt(e.target.value))} /></div>
            <div><Label>Close Confirmation</Label><div className="flex items-center justify-between mt-1"><Switch checked={config.closeConfirmation ?? true} onCheckedChange={(v) => update('closeConfirmation', v)} /></div></div>
          </div>
        </Card>
      </div>
      <SaveBar isDirty={dirty} onSave={save} onDiscard={discard} isSaving={saving} />
    </motion.div>
  );
}
