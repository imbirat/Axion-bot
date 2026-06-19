import { ReactNode } from 'react';
import DashboardShell from './DashboardShell';

export default function GuildDashboardLayout({ children, params }: { children: ReactNode; params: { guildId: string } }) {
  return <DashboardShell guildId={params.guildId}>{children}</DashboardShell>;
}
