'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession, signIn } from 'next-auth/react';
import { Bot, ArrowRight, Shield, Zap, Settings, BarChart3 } from 'lucide-react';

const features = [
  { icon: Shield, label: 'Moderation', desc: 'Advanced moderation tools' },
  { icon: Zap, label: 'Auto-Mod', desc: 'AI-powered content filtering' },
  { icon: Settings, label: 'Customization', desc: 'Full per-server config' },
  { icon: BarChart3, label: 'Analytics', desc: 'Member activity insights' },
];

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <motion.div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[var(--primary)]/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[var(--primary)]/5 blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], rotate: [45, 0, 45] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <Bot className="h-7 w-7 text-[var(--primary)]" />
          <span className="text-lg font-bold">Axion</span>
        </div>
        <div className="flex items-center gap-4">
          {session ? (
            <Link
              href="/servers"
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
            >
              Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              onClick={() => signIn('discord')}
              className="px-5 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
            >
              Login with Discord
            </button>
          )}
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-20">
        <motion.div
          className="text-center max-w-2xl space-y-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            The ultimate{' '}
            <span className="text-[var(--primary)]">Discord</span> bot
          </h1>
          <p className="text-lg text-[var(--muted)] max-w-lg mx-auto">
            Moderation, leveling, tickets, giveaways, and more — all in one powerful bot. Manage everything from a beautiful web dashboard.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link
              href={session ? '/servers' : '/login'}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot+applications.commands"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg border border-[var(--border)] text-sm font-medium hover:bg-[var(--card)] transition-colors"
            >
              Invite Bot
            </a>
          </div>
        </motion.div>

        <motion.div
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] transition-colors text-center space-y-2">
              <Icon className="h-6 w-6 text-[var(--primary)] mx-auto" />
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs text-[var(--muted)]">{desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      <footer className="relative z-10 border-t border-[var(--border)] py-4 text-center text-sm text-[var(--muted)]">
        Axion Bot Dashboard &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
