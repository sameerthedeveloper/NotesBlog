"use client";

import { Eye, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const NOTIFICATIONS = [
  {
    id: 1,
    title: "New Public View Recorded",
    desc: "A reader viewed your public note 'TipTap HTML Formatting Guide'.",
    time: "10 minutes ago",
    icon: Eye,
    iconClass: "text-muted-foreground",
  },
  {
    id: 2,
    title: "HTML Security Sanitizer Active",
    desc: "DOMPurify safely cleansed incoming rich text content without script risks.",
    time: "1 hour ago",
    icon: ShieldCheck,
    iconClass: "text-muted-foreground",
  },
  {
    id: 3,
    title: "Platform Modernization Complete",
    desc: "System upgraded to a Next.js + shadcn/ui interface with full dynamic theme support.",
    time: "2 hours ago",
    icon: RefreshCw,
    iconClass: "text-muted-foreground",
  },
];

export const NotificationsPage = () => {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Notification Center</h1>
          <p className="text-muted-foreground">
            Stay updated with real-time viewer tracking and system alerts.
          </p>
        </div>
        <Button variant="outline" size="sm">Mark All Read</Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        {NOTIFICATIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={
                "flex items-center gap-4 px-5 py-4" +
                (idx < NOTIFICATIONS.length - 1 ? " border-b border-border" : "")
              }
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <Icon className={`size-5 ${item.iconClass}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
              <Badge variant="outline" className="shrink-0 font-semibold">
                {item.time}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationsPage;
