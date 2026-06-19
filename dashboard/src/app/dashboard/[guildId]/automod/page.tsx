'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import TopBar from '@/components/dashboard/TopBar';
import SaveBar from '@/components/dashboard/SaveBar';
import RoleSelect from '@/components/dashboard/RoleSelect';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

export default function AutomodPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const [config, setConfig] = useState<any>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newWord, setNewWord] = useState('');

  useEffect(() => {
    fetch(`/api/guild/${guildId}/automod`)
      .then((r) => r.json())
      .then((d) => setConfig(d));
  }, [guildId]);

  const update = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const addWord = () => {
    if (!newWord.trim()) return;
    const words = config?.blockedWords || [];
    if (!words.includes(newWord.trim())) {
      update('blockedWords', [...words, newWord.trim()]);
    }
    setNewWord('');
  };

  const removeWord = (word: string) => {
    update('blockedWords', (config?.blockedWords || []).filter((w: string) => w !== word));
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/guild/${guildId}/automod`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (res.ok) { toast.success('Saved'); setDirty(false); }
    else toast.error('Failed to save');
    setSaving(false);
  };

  const discard = () => {
    fetch(`/api/guild/${guildId}/automod`)
      .then((r) => r.json())
      .then((d) => { setConfig(d); setDirty(false); });
  };

  if (!config) return <div className="p-8 text-[var(--muted)]">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <TopBar title="Auto-Moderation" />
      <div className="p-6 max-w-3xl space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Filters</h3>
          <div className="flex items-center justify-between">
            <div><Label>Spam Filter</Label><p className="text-xs text-[var(--muted)]">Detect and block spam messages</p></div>
            <Switch checked={config.spamFilter ?? true} onCheckedChange={(v) => update('spamFilter', v)} />
          </div>
          <div className="flex items-center justify-between">
            <div><Label>Link Filter</Label><p className="text-xs text-[var(--muted)]">Block suspicious or invite links</p></div>
            <Switch checked={config.linkFilter ?? false} onCheckedChange={(v) => update('linkFilter', v)} />
          </div>
          <div className="flex items-center justify-between">
            <div><Label>Word Filter</Label><p className="text-xs text-[var(--muted)]">Block messages containing blocked words</p></div>
            <Switch checked={config.wordFilter ?? false} onCheckedChange={(v) => update('wordFilter', v)} />
          </div>
          <div className="flex items-center justify-between">
            <div><Label>Mass Mention Filter</Label><p className="text-xs text-[var(--muted)]">Block messages with too many mentions</p></div>
            <Switch checked={config.massMentionFilter ?? false} onCheckedChange={(v) => update('massMentionFilter', v)} />
          </div>
          <Input type="number" value={config.maxMentions ?? 10} onChange={(e) => update('maxMentions', parseInt(e.target.value))} className="w-24 self-end" placeholder="Max mentions" />
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Blocked Words</h3>
          <div className="flex gap-2">
            <Input value={newWord} onChange={(e) => setNewWord(e.target.value)} placeholder="Add a blocked word" onKeyDown={(e) => e.key === 'Enter' && addWord()} />
            <Button onClick={addWord} variant="outline">Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(config.blockedWords || []).length === 0 && <p className="text-sm text-[var(--muted)]">No blocked words</p>}
            {(config.blockedWords || []).map((word: string) => (
              <span key={word} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--danger)]/10 text-[var(--danger)] text-sm">
                {word}
                <button onClick={() => removeWord(word)} className="hover:opacity-70"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Whitelisted Roles</h3>
          <p className="text-xs text-[var(--muted)]">Roles exempt from auto-moderation</p>
          <RoleSelect guildId={guildId} value={config.whitelistedRole} onChange={(v) => update('whitelistedRole', v)} placeholder="Select a role" />
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Punishment</h3>
          <div className="flex items-center justify-between">
            <div><Label>Punishment Action</Label><p className="text-xs text-[var(--muted)]">Action taken on violation</p></div>
            <select value={config.punishment || 'warn'} onChange={(e) => update('punishment', e.target.value)} className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm">
              <option value="warn">Warn</option>
              <option value="mute">Mute</option>
              <option value="kick">Kick</option>
            </select>
          </div>
        </Card>
      </div>
      <SaveBar isDirty={dirty} onSave={save} onDiscard={discard} isSaving={saving} />
    </motion.div>
  );
}
