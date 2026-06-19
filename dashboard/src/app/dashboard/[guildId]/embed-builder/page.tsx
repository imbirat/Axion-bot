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
import { Send, Trash2, Palette } from 'lucide-react';
import { useParams } from 'next/navigation';
import ChannelSelect from '@/components/dashboard/ChannelSelect';
import { toast } from 'sonner';

export default function EmbedBuilderPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const [channelId, setChannelId] = useState('');
  const [normalText, setNormalText] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [imageUrl, setImageUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [footer, setFooter] = useState('');
  const [sending, setSending] = useState(false);

  const fields: string[] = [];

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
      body: JSON.stringify({ channelId, normalText, title, description, color, imageUrl, thumbnailUrl, footer, fields }),
    });
    if (res.ok) { toast.success('Embed sent!'); reset(); }
    else toast.error('Failed to send embed');
    setSending(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <TopBar title="Embed Builder" />
      <div className="p-6 max-w-5xl space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold">Content</h3>
              <div>
                <Label>Target Channel</Label>
                <ChannelSelect guildId={guildId} value={channelId} onChange={setChannelId} />
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
    </motion.div>
  );
}
