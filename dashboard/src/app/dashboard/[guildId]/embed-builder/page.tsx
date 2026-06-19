'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import TopBar from '@/components/dashboard/TopBar';
import EmbedPreview from '@/components/dashboard/EmbedPreview';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Send, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import ChannelSelect from '@/components/dashboard/ChannelSelect';
import { toast } from 'sonner';

function EmbedBuilder({ guildId }: { guildId: string }) {
  const [channelId, setChannelId] = useState('');
  const [normalText, setNormalText] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [imageUrl, setImageUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [footer, setFooter] = useState('');
  const [sending, setSending] = useState(false);

  const reset = () => {
    setNormalText('');
    setTitle('');
    setDescription('');
    setColor('#3B82F6');
    setImageUrl('');
    setThumbnailUrl('');
    setFooter('');
  };

  const send = async () => {
    if (!channelId) { toast.error('Select a channel'); return; }
    if (!title && !description && !normalText) { toast.error('Add some content'); return; }
    setSending(true);
    const res = await fetch(`/api/guild/${guildId}/embed-builder/send`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId, normalText, title, description, color, imageUrl, thumbnailUrl, footer, fields: [] }),
    });
    if (res.ok) { toast.success('Embed sent!'); reset(); }
    else toast.error('Failed to send embed');
    setSending(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Content</h3>
            <div>
              <Label>Target Channel</Label>
              <ChannelSelect guildId={guildId} value={channelId} onChange={(v) => setChannelId(v || '')} />
            </div>
            <div>
              <Label>Normal Text (above embed)</Label>
              <Textarea value={normalText} onChange={(e) => setNormalText(e.target.value)} rows={2} />
            </div>
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Embed title" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Embed description" />
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex gap-2 items-center">
                <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="#3B82F6" className="w-32 font-mono" />
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-[var(--border)]" />
              </div>
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label>Thumbnail URL</Label>
              <Input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label>Footer</Label>
              <Input value={footer} onChange={(e) => setFooter(e.target.value)} placeholder="Footer text" />
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Preview</h3>
            <EmbedPreview normalText={normalText} title={title} description={description} color={color} imageUrl={imageUrl} thumbnailUrl={thumbnailUrl} footer={footer} />
          </Card>
        </div>
      </div>
      <div className="flex gap-3">
        <Button onClick={send} disabled={sending}>
          <Send className="h-4 w-4 mr-2" /> Send Embed
        </Button>
        <Button variant="outline" onClick={reset}>
          <Trash2 className="h-4 w-4 mr-2" /> Clear
        </Button>
      </div>
    </div>
  );
}

function ContainerBuilder({ guildId }: { guildId: string }) {
  const [channelId, setChannelId] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const sections = content.split('\n---\n').filter(Boolean);

  const reset = () => {
    setContent('');
  };

  const send = async () => {
    if (!channelId) { toast.error('Select a channel'); return; }
    if (!content.trim()) { toast.error('Add some content'); return; }
    setSending(true);
    const res = await fetch(`/api/guild/${guildId}/embed-builder/send`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channelId,
        content: content,
        container: true,
      }),
    });
    if (res.ok) { toast.success('Container sent!'); reset(); }
    else toast.error('Failed to send container');
    setSending(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Container Content</h3>
            <div>
              <Label>Target Channel</Label>
              <ChannelSelect guildId={guildId} value={channelId} onChange={(v) => setChannelId(v || '')} />
            </div>
            <div>
              <Label>Content</Label>
              <p className="text-xs text-[var(--muted)] mb-2">Use <code className="text-[var(--primary)]">---</code> on its own line to split sections</p>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                placeholder={`Welcome to our server!\n---\nCheck out our rules in #rules\n---\nNeed help? Open a ticket!`}
                className="font-mono text-sm"
              />
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Preview</h3>
            {sections.length > 0 ? (
              <div className="space-y-2">
                {sections.map((section, i) => (
                  <div key={i} className="p-3 rounded-md bg-[var(--card)] border border-[var(--border)]">
                    <p className="text-xs text-[var(--muted)] mb-1">Section {i + 1}</p>
                    <p className="text-sm whitespace-pre-wrap">{section.trim()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
                <p className="text-sm">Sections will appear here</p>
                <p className="text-xs mt-1">Separate with <code className="text-[var(--primary)]">---</code></p>
              </div>
            )}
          </Card>
        </div>
      </div>
      <div className="flex gap-3">
        <Button onClick={send} disabled={sending}>
          <Send className="h-4 w-4 mr-2" /> Send Container
        </Button>
        <Button variant="outline" onClick={reset}>
          <Trash2 className="h-4 w-4 mr-2" /> Clear
        </Button>
      </div>
    </div>
  );
}

export default function EmbedBuilderPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const [tab, setTab] = useState('embed');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <TopBar title="Embed & Container Builder" />
      <div className="p-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="embed">Embed Builder</TabsTrigger>
            <TabsTrigger value="container">Container Builder</TabsTrigger>
          </TabsList>
          <TabsContent value="embed" className="mt-6">
            <EmbedBuilder guildId={guildId} />
          </TabsContent>
          <TabsContent value="container" className="mt-6">
            <ContainerBuilder guildId={guildId} />
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
