'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { Loader2, AlertCircle } from 'lucide-react';

export default function DashboardShell({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const guildId = params.guildId as string;
  const [guild, setGuild] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status !== 'authenticated' || !guildId) return;

    fetch(`/api/discord/guild/${guildId}`)
      .then((r) => {
        if (!r.ok) throw new Error('Bot is not in this server or you lack permissions');
        return r.json();
      })
      .then((d) => setGuild(d))
      .catch((e) => setError(e.message));
  }, [status, guildId, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertCircle className="h-12 w-12 text-[var(--danger)] mx-auto" />
          <p className="text-[var(--muted)]">{error}</p>
          <button onClick={() => router.push('/servers')} className="text-[var(--primary)] hover:underline text-sm">
            Go back to server list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar
        guildName={guild?.name}
        guildIcon={guild?.icon}
        memberCount={guild?.approximate_member_count}
        userName={session?.user?.name}
        userImage={session?.user?.image}
      />
      <main className="ml-[260px] min-h-screen">
        {children}
      </main>
    </div>
  );
}
