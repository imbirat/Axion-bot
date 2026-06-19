'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Users, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  approximate_member_count?: number;
}

export default function ServersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status !== 'authenticated') return;

    const fetchGuilds = async () => {
      try {
        const res = await fetch('/api/discord/guilds');
        if (!res.ok) throw new Error('Failed to fetch guilds');
        const data = await res.json();
        setGuilds(data.filter((g: Guild) => (g.owner || (BigInt(g.permissions) & BigInt(0x20)) !== BigInt(0))));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGuilds();
  }, [status, router]);

  if (status === 'loading' || loading) {
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
          <button onClick={() => router.push('/login')} className="text-[var(--primary)] hover:underline text-sm">
            Try logging in again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-3">
          <Bot className="h-7 w-7 text-[var(--primary)]" />
          <span className="text-lg font-bold">Axion</span>
        </Link>
        <div className="flex items-center gap-3">
          {session?.user?.image && (
            <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
          )}
          <span className="text-sm text-[var(--muted)]">{session?.user?.name}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-2">Select a Server</h1>
          <p className="text-[var(--muted)] mb-8">Choose a server to manage with Axion</p>

          {guilds.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Users className="h-12 w-12 text-[var(--muted)] mx-auto" />
              <p className="text-[var(--muted)]">No manageable servers found</p>
              <p className="text-sm text-[var(--muted)]">
                Make sure Axion is in your server and you have the &quot;Manage Server&quot; permission.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {guilds.map((guild) => (
                <Link key={guild.id} href={`/dashboard/${guild.id}`}>
                  <motion.div
                    className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] transition-colors cursor-pointer space-y-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      {guild.icon ? (
                        <img src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=64`} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold text-sm">
                          {guild.name[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{guild.name}</p>
                        {guild.approximate_member_count && (
                          <p className="text-xs text-[var(--muted)]">{guild.approximate_member_count.toLocaleString()} members</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
