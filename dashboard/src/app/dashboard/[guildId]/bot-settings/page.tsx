'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import TopBar from '@/components/dashboard/TopBar';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

export default function BotSettingsPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const [config, setConfig] = useState<any>(null);
  const [newPrefix, setNewPrefix] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/guild/${guildId}/config`)
      .then((r) => r.json())
      .then((d) => setConfig(d));
  }, [guildId]);

  const update = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const addPrefix = () => {
    if (!newPrefix.trim()) return;
    const prefixes = config?.prefix || [];
    if (prefixes.includes(newPrefix.trim())) return;
    update('prefix', [...prefixes, newPrefix.trim()]);
    setNewPrefix('');
    saveField('prefix', [...(config?.prefix || []), newPrefix.trim()]);
  };

  const removePrefix = (prefix: string) => {
    const prefixes = (config?.prefix || []).filter((p: string) => p !== prefix);
    update('prefix', prefixes);
    saveField('prefix', prefixes);
  };

  const saveField = async (key: string, value: any) => {
    const res = await fetch(`/api/guild/${guildId}/config`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: value }),
    });
    if (res.ok) toast.success(`${key} updated`);
    else toast.error(`Failed to update ${key}`);
  };

  const handleSave = async (key: string, value: any) => {
    setSaving(true);
    await saveField(key, value);
    setSaving(false);
  };

  if (!config) return <div className="p-8 text-[var(--muted)]">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <TopBar title="Bot Settings" />
      <div className="p-6 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 space-y-4">
              <div>
                <Label>Nickname</Label>
                <p className="text-xs text-[var(--muted)] mb-2">Set the bot&apos;s display name in the server.</p>
                <div className="flex gap-2">
                  <Input value={config.nickname || ''} onChange={(e) => update('nickname', e.target.value)} placeholder="Axion" className="max-w-xs" />
                  <Button onClick={() => handleSave('nickname', config.nickname)} disabled={saving}>Save</Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div>
                <Label>Custom Prefix</Label>
                <p className="text-xs text-[var(--muted)] mb-2">Set one or more prefix</p>
                <div className="flex gap-2 mb-3">
                  <Input value={newPrefix} onChange={(e) => setNewPrefix(e.target.value)} placeholder="Enter a prefix" className="max-w-xs" onKeyDown={(e) => e.key === 'Enter' && addPrefix()} />
                  <Button onClick={addPrefix} variant="outline"><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(config.prefix || []).map((p: string) => (
                    <span key={p} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--card)] border border-[var(--border)] text-sm font-mono">
                      {p}
                      <button onClick={() => removePrefix(p)} className="text-[var(--muted)] hover:text-[var(--danger)] transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                  {(config.prefix || []).length === 0 && <p className="text-sm text-[var(--muted)]">No custom prefixes</p>}
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-sm">Last actions</h3>
              <p className="text-xs text-[var(--muted)]">Recent action</p>
              <div className="space-y-2">
                <div className="text-xs text-[var(--muted)] p-2 rounded bg-[var(--card)]">
                  <p className="text-[var(--text)] font-medium">Dashboard connected</p>
                  <p className="text-[var(--muted)]">Server configuration loaded</p>
                </div>
                <div className="text-xs text-[var(--muted)] p-2 rounded bg-[var(--card)]">
                  <p className="text-[var(--text)] font-medium">Prefix updated</p>
                  <p className="text-[var(--muted)]">Added prefix &quot;/&quot;</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-sm text-[var(--danger)] flex items-center gap-2">
                <Trash2 className="h-4 w-4" /> Danger Zone
              </h3>
              <button
                className="w-full px-4 py-2 rounded-md bg-[var(--danger)] text-white text-sm hover:opacity-90 transition-opacity"
                onClick={async () => {
                  if (confirm('Are you sure? This cannot be undone.')) {
                    await fetch(`/api/guild/${guildId}/config`, { method: 'DELETE' });
                    toast.success('Settings reset');
                    setConfig(null);
                  }
                }}
              >
                Reset All Settings
              </button>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
