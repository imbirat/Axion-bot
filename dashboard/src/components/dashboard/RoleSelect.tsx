'use client';

import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Role {
  id: string;
  name: string;
  color: number;
}

interface RoleSelectProps {
  guildId: string;
  value?: string;
  onChange: (roleId: string | null) => void;
  placeholder?: string;
  exclude?: string[];
}

export default function RoleSelect({ guildId, value, onChange, placeholder = 'Select a role', exclude }: RoleSelectProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/discord/guild/${guildId}/roles`)
      .then((r) => r.json())
      .then((data) => {
        setRoles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [guildId]);

  const filtered = exclude ? roles.filter((r) => !exclude.includes(r.id)) : roles;

  return (
    <Select
      value={value || ''}
      onValueChange={(v) => onChange(v || null)}
      disabled={loading}
    >
      <SelectTrigger>
        <SelectValue placeholder={loading ? 'Loading roles...' : placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">None (clear)</SelectItem>
        {filtered.map((r) => (
          <SelectItem key={r.id} value={r.id}>
            <span className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: r.color ? `#${r.color.toString(16).padStart(6, '0')}` : '#99AAB5' }} />
              {r.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
