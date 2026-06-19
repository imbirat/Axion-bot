'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Settings, Shield, Bot, Radiation, TrendingUp, Hand, Ticket, Gift,
  Star, CheckCircle, ScrollText, Code, Bell, UserPlus, LogOut, Users,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

const navItems = [
  { section: 'GENERAL' },
  { label: 'Bot Settings', href: 'bot-settings', icon: Settings },
  { label: 'Moderation', href: 'moderation', icon: Shield },
  { section: 'AUTOMATION' },
  { label: 'Auto-Mod', href: 'automod', icon: Bot },
  { label: 'Anti-Nuke', href: 'antinuke', icon: Radiation },
  { section: 'ENGAGEMENT' },
  { label: 'Leveling', href: 'leveling', icon: TrendingUp },
  { label: 'Greetings', href: 'greetings', icon: Hand },
  { section: 'COMMUNITY' },
  { label: 'Tickets', href: 'tickets', icon: Ticket },
  { label: 'Giveaways', href: 'giveaways', icon: Gift },
  { label: 'Reaction Roles', href: 'reaction-roles', icon: Star },
  { label: 'Verification', href: 'verification', icon: CheckCircle },
  { section: 'TOOLS' },
  { label: 'Logging', href: 'logging', icon: ScrollText },
  { label: 'Embed Builder', href: 'embed-builder', icon: Code },
  { label: 'Notifications', href: 'notifications', icon: Bell },
  { label: 'Auto Roles', href: 'autoroles', icon: UserPlus },
];

interface SidebarProps {
  guildName?: string;
  guildIcon?: string | null;
  memberCount?: number;
  userName?: string | null;
  userImage?: string | null;
}

export default function Sidebar({ guildName, guildIcon, memberCount, userName, userImage }: SidebarProps) {
  const params = useParams();
  const guildId = params?.guildId as string;
  const pathname = usePathname();
  const currentTab = pathname?.split('/').pop();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-[var(--sidebar)] border-r border-[var(--border)] flex flex-col z-50">
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          {guildIcon ? (
            <img src={`https://cdn.discordapp.com/icons/${guildId}/${guildIcon}.png`} alt="" className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold text-sm">
              {guildName?.[0] || '?'}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text)] truncate">{guildName || 'Server'}</p>
            {memberCount !== undefined && (
              <p className="text-xs text-[var(--muted)] flex items-center gap-1">
                <Users className="h-3 w-3" /> {memberCount.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item, i) => {
          if ('section' in item) {
            return (
              <p key={i} className="text-xs font-semibold text-[var(--muted)] px-2 pt-4 pb-1 uppercase tracking-wider">
                {item.section}
              </p>
            );
          }
          const Icon = item.icon;
          const isActive = currentTab === item.href;
          return (
            <Link
              key={item.href}
              href={`/dashboard/${guildId}/${item.href}`}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors relative ${
                isActive
                  ? 'text-[var(--primary)] bg-[var(--primary)]/10'
                  : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--card-hover)]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--primary)] rounded-r-full"
                />
              )}
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {userImage ? (
            <img src={userImage} alt="" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[var(--card)]" />
          )}
          <span className="text-sm text-[var(--text)] truncate">{userName || 'User'}</span>
        </div>
        <button onClick={() => signOut()} className="text-[var(--muted)] hover:text-[var(--danger)] transition-colors">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
