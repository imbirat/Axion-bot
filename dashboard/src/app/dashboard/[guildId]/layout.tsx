import { ReactNode, use } from 'react';
import DashboardShell from './DashboardShell';

export default function GuildDashboardLayout({ children, params }: { children: ReactNode; params: Promise<{ guildId: string }> }) {
  const { guildId } = use(params);
  return <DashboardShell guildId={guildId}>{children}</DashboardShell>;
}
