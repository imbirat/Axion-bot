'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import TopBar from '@/components/dashboard/TopBar';
import SaveBar from '@/components/dashboard/SaveBar';
import ChannelSelect from '@/components/dashboard/ChannelSelect';
import RoleSelect from '@/components/dashboard/RoleSelect';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

interface ReactionRoleEntry {
  emoji: string;
  roleId: string;
}

export default function ReactionRolesPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const [configs, setConfigs] = useState<ReactionRoleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newEntry, setNewEntry] = useState<ReactionRoleEntry>({ emoji: '', roleId: '' });
  const [messageId, setMessageId] = useState('');
  const [channelId, setChannelId] = useState('');

  useEffect(() => {
    fetch(`/api/guild/${guildId}/reaction-roles`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.entries)) setConfigs(data.entries);
        setMessageId(data.messageId || '');
        setChannelId(data.channelId || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [guildId]);

  const addEntry = () => {
    if (!newEntry.emoji.trim() || !newEntry.roleId) return;
    setConfigs((prev) => [...prev, { ...newEntry }]);
    setNewEntry({ emoji: '', roleId: '' });
    setDirty(true);
  };

  const removeEntry = (index: number) => {
    setConfigs((prev) => prev.filter((_, i) => i !== index));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/guild/${guildId}/reaction-roles`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: configs, messageId, channelId }),
    });
    if (res.ok) { toast.success('Saved'); setDirty(false); } else toast.error('Failed to save');
    setSaving(false);
  };

  const discard = () => {
    fetch(`/api/guild/${guildId}/reaction-roles`)
      .then((r) => r.json())
      .then((data) => {
        setConfigs(Array.isArray(data.entries) ? data.entries : []);
        setMessageId(data.messageId || '');
        setChannelId(data.channelId || '');
        setDirty(false);
      });
  };

  if (loading) return <div className="p-8 text-[var(--muted)]">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <TopBar title="Reaction Roles" />
      <div className="p-6 max-w-3xl space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Message Target</h3>
          <p className="text-xs text-[var(--muted)]">Channel and message ID where reactions will be monitored</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Channel</Label>
              <ChannelSelect guildId={guildId} value={channelId} onChange={(v) => { setChannelId(v || ''); setDirty(true); }} />
            </div>
            <div>
              <Label>Message ID</Label>
              <Input value={messageId} onChange={(e) => { setMessageId(e.target.value); setDirty(true); }} placeholder="Message ID" />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Role-Emoji Mappings</h3>
          <p className="text-xs text-[var(--muted)]">When users react with the emoji, they get the role</p>
          {configs.length > 0 && (
            <div className="space-y-2">
              {configs.map((entry, index) => (
                <div key={index} className="flex items-center justify-between px-3 py-2 rounded-md bg-[var(--card)]">
                  <span className="text-sm">{entry.emoji}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--muted)]">Role ID: {entry.roleId}</span>
                    <button onClick={() => removeEntry(index)} className="text-[var(--danger)] hover:opacity-70"><X className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 items-end">
            <div className="w-24">
              <Label>Emoji</Label>
              <Input value={newEntry.emoji} onChange={(e) => setNewEntry({ ...newEntry, emoji: e.target.value })} placeholder=":emoji:" />
            </div>
            <div className="flex-1">
              <Label>Role</Label>
              <RoleSelect guildId={guildId} value={newEntry.roleId} onChange={(v) => setNewEntry({ ...newEntry, roleId: v || '' })} />
            </div>
            <Button onClick={addEntry} variant="outline" className="mb-0.5"><Plus className="h-4 w-4" /></Button>
          </div>
        </Card>
      </div>
      <SaveBar isDirty={dirty} onSave={save} onDiscard={discard} isSaving={saving} />
    </motion.div>
  );
}
