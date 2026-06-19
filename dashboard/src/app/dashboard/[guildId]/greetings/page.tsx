'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import TopBar from '@/components/dashboard/TopBar';
import ChannelSelect from '@/components/dashboard/ChannelSelect';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

const vars = [
  '{mention}', '{server}', '{membercount}',
  '{user:tag}', '{user:id}',
];

function GreetingSection({
  title,
  channelKey,
  messageKey,
  embedKey,
  embedTitleKey,
  embedFooterKey,
  embedThumbnailKey,
  config,
  guildId,
  defaultMessage,
  onUpdate,
  onSave,
  saving,
  showThumbnail,
}: {
  title: string;
  channelKey: string;
  messageKey: string;
  embedKey: string;
  embedTitleKey?: string;
  embedFooterKey?: string;
  embedThumbnailKey?: string;
  config: any;
  guildId: string;
  defaultMessage: string;
  onUpdate: (key: string, value: any) => void;
  onSave: (keys: string[]) => Promise<void>;
  saving: boolean;
  showThumbnail?: boolean;
}) {
  const [localSaving, setLocalSaving] = useState(false);

  const embedOn = config?.[embedKey] ?? false;

  const handleSave = async () => {
    setLocalSaving(true);
    const keys = [channelKey, messageKey, embedKey];
    if (embedTitleKey) keys.push(embedTitleKey);
    if (embedFooterKey) keys.push(embedFooterKey);
    if (embedThumbnailKey) keys.push(embedThumbnailKey);
    await onSave(keys);
    setLocalSaving(false);
  };

  const handleClear = () => {
    onUpdate(messageKey, defaultMessage);
    onUpdate(channelKey, null);
    onUpdate(embedKey, false);
    if (embedTitleKey) onUpdate(embedTitleKey, '');
    if (embedFooterKey) onUpdate(embedFooterKey, true);
    if (embedThumbnailKey) onUpdate(embedThumbnailKey, true);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title} Channel</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleClear} disabled={saving || localSaving}>Clear</Button>
          <Button size="sm" onClick={handleSave} disabled={saving || localSaving}>Save</Button>
        </div>
      </div>

      <ChannelSelect guildId={guildId} value={config?.[channelKey]} onChange={(v) => onUpdate(channelKey, v)} placeholder={`Select ${title.toLowerCase()} channel`} />

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>{title} Message</Label>
          <div className="flex items-center gap-2">
            <Label className="text-xs">Embed</Label>
            <Switch checked={embedOn} onCheckedChange={(v) => onUpdate(embedKey, v)} />
          </div>
        </div>
        <Textarea
          value={config?.[messageKey] || defaultMessage}
          onChange={(e) => onUpdate(messageKey, e.target.value)}
          rows={3}
          placeholder={defaultMessage}
        />
      </div>

      {embedOn && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pl-4 border-l-2 border-[var(--primary)]">
          <Label>Embed Message</Label>
          {embedTitleKey && (
            <div>
              <Label className="text-xs">Title</Label>
              <Input value={config?.[embedTitleKey] || ''} onChange={(e) => onUpdate(embedTitleKey, e.target.value)} placeholder="Embed title" />
            </div>
          )}
          <div>
            <Label className="text-xs">Content</Label>
            <Textarea value={config?.[messageKey] || ''} onChange={(e) => onUpdate(messageKey, e.target.value)} rows={3} placeholder="Embed content" />
          </div>
          <div className="flex gap-4">
            {embedFooterKey && (
              <div className="flex items-center gap-2">
                <Switch checked={config?.[embedFooterKey] ?? true} onCheckedChange={(v) => onUpdate(embedFooterKey, v)} />
                <Label className="text-xs">Footer (timestamp)</Label>
              </div>
            )}
            {showThumbnail && embedThumbnailKey && (
              <div className="flex items-center gap-2">
                <Switch checked={config?.[embedThumbnailKey] ?? true} onCheckedChange={(v) => onUpdate(embedThumbnailKey, v)} />
                <Label className="text-xs">Thumbnail (user avatar)</Label>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </Card>
  );
}

export default function GreetingsPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const [config, setConfig] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/guild/${guildId}/greetings`)
      .then((r) => r.json())
      .then((d) => setConfig(d));
  }, [guildId]);

  const update = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const onSave = async (keys: string[]) => {
    setSaving(true);
    const payload: Record<string, any> = {};
    for (const key of keys) {
      if (key in config) payload[key] = config[key];
    }
    const res = await fetch(`/api/guild/${guildId}/greetings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) toast.success('Saved');
    else toast.error('Failed to save');
    setSaving(false);
  };

  if (!config) return <div className="p-8 text-[var(--muted)]">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <TopBar title="Greetings" />
      <div className="p-6 max-w-3xl space-y-6">
        <Card className="p-4">
          <p className="text-sm text-[var(--muted)] mb-2">Useful variables:</p>
          <div className="flex flex-wrap gap-2">
            {vars.map((v) => (
              <code key={v} className="px-2 py-1 rounded bg-[var(--card)] text-sm text-[var(--primary)] cursor-pointer hover:bg-[var(--card-hover)]"
                onClick={() => navigator.clipboard.writeText(v)}>{v}</code>
            ))}
          </div>
        </Card>

        <GreetingSection
          title="Welcome"
          channelKey="welcomeChannel"
          messageKey="welcomeMessage"
          embedKey="welcomeEmbed"
          embedTitleKey="welcomeEmbedTitle"
          embedFooterKey="welcomeEmbedFooter"
          embedThumbnailKey="welcomeEmbedThumbnail"
          config={config}
          guildId={guildId}
          defaultMessage="Welcome {mention} to {server}!"
          onUpdate={update}
          onSave={onSave}
          saving={saving}
          showThumbnail
        />

        <GreetingSection
          title="Farewell"
          channelKey="farewellChannel"
          messageKey="farewellMessage"
          embedKey="farewellEmbed"
          embedTitleKey="farewellEmbedTitle"
          embedFooterKey="farewellEmbedFooter"
          config={config}
          guildId={guildId}
          defaultMessage="Goodbye {user:tag}!"
          onUpdate={update}
          onSave={onSave}
          saving={saving}
        />

        <GreetingSection
          title="Booster"
          channelKey="boosterChannel"
          messageKey="boosterMessage"
          embedKey="boosterEmbed"
          embedTitleKey="boosterEmbedTitle"
          config={config}
          guildId={guildId}
          defaultMessage="{mention} has boosted the server Yay!"
          onUpdate={update}
          onSave={onSave}
          saving={saving}
        />
      </div>
    </motion.div>
  );
}
