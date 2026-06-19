'use client';

import { useEffect, useState } from 'react';

interface TopBarProps {
  title: string;
  guildName?: string;
}

export default function TopBar({ title, guildName }: TopBarProps) {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/health');
        setOnline(res.ok);
      } catch {
        setOnline(false);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-[var(--background)] border-b border-[var(--border)] flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-bold text-[var(--text)]">{title}</h1>
        {guildName && <p className="text-xs text-[var(--muted)]">{guildName}</p>}
      </div>
      <div className="flex items-center gap-2">
        <span className={`inline-block w-2 h-2 rounded-full ${online ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'}`} />
        <span className="text-sm text-[var(--muted)]">{online ? 'Online' : 'Offline'}</span>
      </div>
    </header>
  );
}
