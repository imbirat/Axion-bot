'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import TopBar from '@/components/dashboard/TopBar';
import SaveBar from '@/components/dashboard/SaveBar';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

export default function BotSettingsPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const [config, setConfig] = useState<any>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/guild/${guildId}/config`)
      .then((r) => r.json())
      .then((d) => { setConfig(d); });
  }, [guildId]);

  const update = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/guild/${guildId}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (res.ok) {
      toast.success('Settings saved');
      setDirty(false);
    } else {
      toast.error('Failed to save settings');
    }
    setSaving(false);
  };

  const discard = () => {
    fetch(`/api/guild/${guildId}/config`)
      .then((r) => r.json())
      .then((d) => { setConfig(d); setDirty(false); });
  };

  if (!config) return <div className="p-8 text-[var(--muted)]">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <TopBar title="Bot Settings" />
      <div className="p-6 max-w-3xl space-y-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Bot Prefix</Label>
              <p className="text-xs text-[var(--muted)]">Prefix commands trigger (hardcoded to / and .)</p>
            </div>
            <Input value="/ ." disabled className="w-32 text-center" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Default Language</Label>
              <p className="text-xs text-[var(--muted)]">Bot response language</p>
            </div>
            <Select value={config.language || 'en'} onValueChange={(v) => update('language', v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>DM Notifications</Label>
              <p className="text-xs text-[var(--muted)]">Send notification DMs when applicable</p>
            </div>
            <Switch checked={config.dmNotifications ?? true} onCheckedChange={(v) => update('dmNotifications', v)} />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-sm text-[var(--danger)] flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> Danger Zone
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <Label>Reset All Settings</Label>
              <p className="text-xs text-[var(--muted)]">Reset this server&apos;s configuration to defaults</p>
            </div>
            <button
              className="px-4 py-2 rounded-md bg-[var(--danger)] text-white text-sm hover:opacity-90 transition-opacity"
              onClick={async () => {
                if (confirm('Are you sure? This cannot be undone.')) {
                  await fetch(`/api/guild/${guildId}/config`, { method: 'DELETE' });
                  toast.success('Settings reset');
                  setConfig(null);
                }
              }}
            >
              Reset
            </button>
          </div>
        </Card>
      </div>
      <SaveBar isDirty={dirty} onSave={save} onDiscard={discard} isSaving={saving} />
    </motion.div>
  );
}
