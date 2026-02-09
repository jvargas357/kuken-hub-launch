// Mock data for the self-hosted dashboard

export interface SystemMetric {
  label: string;
  value: number;
  max: number;
  unit: string;
  icon: string;
  status: "healthy" | "warning" | "critical";
}

export interface ActivityItem {
  id: string;
  type: "media" | "file" | "security";
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  status?: "info" | "warning" | "error";
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  destructive: boolean;
  confirmMessage: string;
}

export const systemMetrics: SystemMetric[] = [
  { label: "CPU", value: 23, max: 100, unit: "%", icon: "Cpu", status: "healthy" },
  { label: "Memory", value: 61, max: 100, unit: "%", icon: "MemoryStick", status: "warning" },
  { label: "Disk", value: 442, max: 1000, unit: "GB", icon: "HardDrive", status: "healthy" },
  { label: "Uptime", value: 47, max: 99, unit: "days", icon: "Clock", status: "healthy" },
];

export const recentActivity: ActivityItem[] = [
  {
    id: "1",
    type: "media",
    title: "Now Playing — Jellyfin",
    description: "Dune: Part Two (2024) — 1h 23m remaining",
    timestamp: "2 min ago",
    icon: "Play",
    status: "info",
  },
  {
    id: "2",
    type: "media",
    title: "Media Added",
    description: "3 new episodes of Severance S2 added to library",
    timestamp: "14 min ago",
    icon: "Film",
    status: "info",
  },
  {
    id: "3",
    type: "file",
    title: "File Sync Complete",
    description: "Nextcloud synced 28 files (1.2 GB) to /Documents",
    timestamp: "1 hr ago",
    icon: "FolderSync",
    status: "info",
  },
  {
    id: "4",
    type: "security",
    title: "Failed Login Attempt",
    description: "3 failed SSH attempts from 192.168.1.105",
    timestamp: "3 hrs ago",
    icon: "ShieldAlert",
    status: "warning",
  },
  {
    id: "5",
    type: "security",
    title: "Backup Overdue",
    description: "Vaultwarden backup hasn't run in 48 hours",
    timestamp: "6 hrs ago",
    icon: "AlertTriangle",
    status: "error",
  },
  {
    id: "6",
    type: "file",
    title: "Storage Quota Alert",
    description: "Nextcloud storage at 82% capacity (410 GB / 500 GB)",
    timestamp: "12 hrs ago",
    icon: "Database",
    status: "warning",
  },
];

export const quickActions: QuickAction[] = [
  {
    id: "restart-jellyfin",
    label: "Restart Jellyfin",
    description: "Restart the media server container",
    icon: "RotateCcw",
    destructive: true,
    confirmMessage: "This will restart Jellyfin and interrupt any active streams. Continue?",
  },
  {
    id: "backup-vault",
    label: "Backup Vault",
    description: "Trigger Vaultwarden backup now",
    icon: "Download",
    destructive: false,
    confirmMessage: "Start a manual backup of Vaultwarden data?",
  },
];
