import { ReactNode } from 'react';
import DashboardShell from './DashboardShell';

export default function GuildDashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
