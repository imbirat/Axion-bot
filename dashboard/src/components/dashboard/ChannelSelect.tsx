'use client';

import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Channel {
  id: string;
  name: string;
  type: number;
}

interface ChannelSelectProps {
  guildId: string;
  value?: string;
  onChange: (channelId: string | null) => void;
  placeholder?: string;
  includeCategories?: boolean;
}

export default function ChannelSelect({ guildId, value, onChange, placeholder = 'Select a channel', includeCategories }: ChannelSelectProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/discord/guild/${guildId}/channels`)
      .then((r) => r.json())
      .then((data) => {
        setChannels(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [guildId]);

  const filtered = channels.filter((c) => includeCategories || c.type !== 4);

  return (
    <Select
      value={value || ''}
      onValueChange={(v) => onChange(v || null)}
      disabled={loading}
    >
      <SelectTrigger>
        <SelectValue placeholder={loading ? 'Loading channels...' : placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">None (clear)</SelectItem>
        {filtered.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            #{c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
