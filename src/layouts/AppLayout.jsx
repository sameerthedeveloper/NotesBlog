"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Menu as MenuIcon,
  PanelLeft,
  PanelLeftOpen,
  Plus,
  Notebook,
  User,
  LogOut,
  Moon,
  Sun,
  Search,
  Bookmark,
  Settings,
  X,
  Compass,
  LayoutDashboard,
  Bell,
  Share2,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  MessagesSquare,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import PromptBuilderModal from "@/components/PromptBuilderModal";
import OnboardingWizardModal from "@/components/OnboardingWizardModal";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/context/ThemeContext";
import { useNetworkStatus } from "@/utils/offlineSyncManager";
import { usePlatformSettings } from "@/context/PlatformSettingsContext";
import { isSuperAdmin } from "@/config/adminConfig";
import { cn } from "@/lib/utils";

const BOTTOM_NAV_ITEMS = [
  { label: "Home", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Notes", icon: Notebook, path: "/notes" },
  { label: "Discover", icon: Compass, path: "/discover" },
  { label: "Bookmarks", icon: Bookmark, path: "/bookmarks" },
  { label: "Search", icon: Search, path: "/search" },
  { label: "Menu", icon: MenuIcon, action: "menu" },
];

function useNavGroups() {
  const { currentUser } = useAuth();
  const { settings } = usePlatformSettings();

  const workspace = [
    { text: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { text: "My Notes", icon: Notebook, path: "/notes" },
    { text: "Discover", icon: Compass, path: "/discover" },
    { text: "Community", icon: MessagesSquare, path: "/community" },
    { text: "Shared Notes", icon: Share2, path: "/shared" },
    { text: "Bookmarks", icon: Bookmark, path: "/bookmarks" },
    ...(settings?.creatorMonetization?.enableCreatorMonetization !== false
      ? [{ text: "Monetization", icon: Sparkles, path: "/monetization" }]
      : []),
  ];

  const tools = [
    { text: "Search", icon: Search, path: "/search" },
    { text: "Notifications", icon: Bell, path: "/notifications", badge: 2 },
  ];

  const admin = isSuperAdmin(currentUser)
    ? [{ text: "Admin Panel", icon: ShieldCheck, path: "/admin" }]
    : [];

  return { workspace, tools, admin };
}

function NavList({ items, pathname, onNavigate, collapsed }) {
  return (
    <nav className={cn("flex flex-col gap-1", collapsed ? "items-center px-1.5" : "px-2")}>
      {items.map((item) => {
        const isSelected = Boolean(item.path) && pathname === item.path;
        const Icon = item.icon;

        const buttonClassName = cn(
          "relative flex items-center rounded-lg text-left text-sm transition-colors",
          collapsed ? "size-10 shrink-0 justify-center" : "w-full gap-3 px-3 py-2",
          isSelected
            ? "bg-primary/10 font-semibold text-primary"
            : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        );

        const buttonContent = (
          <>
            <Icon className={collapsed ? "size-5 shrink-0" : "size-4.5 shrink-0"} />
            {!collapsed && <span className="flex-1">{item.text}</span>}
            {Boolean(item.badge) &&
              (collapsed ? (
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
              ) : (
                <Badge className="h-4 min-w-4 justify-center rounded-full px-1 text-[10px]">
                  {item.badge}
                </Badge>
              ))}
          </>
        );

        if (!collapsed) {
          return (
            <button
              key={item.text}
              onClick={() => (item.onClick ? item.onClick() : onNavigate(item.path))}
              className={buttonClassName}
            >
              {buttonContent}
            </button>
          );
        }

        const button = (
          <button
            onClick={() => (item.onClick ? item.onClick() : onNavigate(item.path))}
            className={buttonClassName}
          >
            {buttonContent}
          </button>
        );

        return (
          <Tooltip key={item.text}>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="right">{item.text}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}

function NavGroupLabel({ collapsed, children }) {
  if (collapsed) {
    return <div className="my-2 h-px w-8 self-center bg-border" />;
  }
  return (
    <p className="px-3 pt-4 pb-1 font-mono text-[11px] font-bold tracking-wider text-muted-foreground/70 uppercase">
      {children}
    </p>
  );
}

function SidebarNav({
  currentUser,
  initial,
  mode,
  toggleColorMode,
  navGroups,
  pathname,
  onNavigate,
  onCreateNote,
  onHelp,
  onLogout,
  onOpenAI,
  aiEnabled,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onToggleSidebar,
  collapsed = false,
}) {
  const toolsItems = [
    ...(aiEnabled ? [{ text: "AI Assistant", icon: Sparkles, onClick: onOpenAI }] : []),
    ...navGroups.tools,
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Logo + sidebar controls */}
      <div
        className={cn(
          "flex items-center border-b border-border py-3",
          collapsed ? "flex-col gap-2 px-2" : "justify-between gap-2 px-3"
        )}
      >
        <Link href="/dashboard" className={cn("flex min-w-0 items-center gap-2", collapsed && "justify-center")}>
          <Image
            src="/logo.svg"
            alt="OpenNotes"
            width={28}
            height={28}
            className="shrink-0 rounded-md"
          />
          {!collapsed && (
            <span className="truncate text-base font-extrabold tracking-tight text-foreground">
              OpenNotes
            </span>
          )}
        </Link>
        <div className={cn("flex shrink-0 items-center gap-0.5", collapsed && "flex-col")}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleColorMode}
                aria-label="toggle theme"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
              >
                {mode === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side={collapsed ? "right" : "bottom"}>
              {mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            </TooltipContent>
          </Tooltip>
          {onToggleSidebar && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onToggleSidebar}
                  aria-label={collapsed ? "expand sidebar" : "collapse sidebar"}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                >
                  {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeft className="size-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side={collapsed ? "right" : "bottom"}>
                {collapsed ? "Expand sidebar" : "Collapse sidebar"}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Profile control */}
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex w-full items-center border-b border-border text-left hover:bg-muted",
                  collapsed ? "justify-center py-3" : "gap-2.5 px-3 py-3"
                )}
              >
                <Avatar className="size-8 shrink-0">
                  <AvatarImage src={currentUser?.photoURL || undefined} />
                  <AvatarFallback className="bg-muted text-sm font-bold text-foreground">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">
                        {currentUser?.displayName || "User"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {currentUser?.email}
                      </p>
                    </div>
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right">{currentUser?.displayName || "User"}</TooltipContent>
          )}
        </Tooltip>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuItem onClick={() => onNavigate("/profile")}>
            <User />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={onLogout}>
            <LogOut />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Search */}
      {!collapsed && (
        <div className="px-2 pt-2">
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 focus-within:bg-background focus-within:ring-2 focus-within:ring-ring/40">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={onSearchChange}
              onKeyDown={onSearchSubmit}
              className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange({ target: { value: "" } })}
                aria-label="clear search"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className={cn("mt-2", collapsed ? "flex justify-center px-1.5" : "px-2")}>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" onClick={onCreateNote}>
                <Plus className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Create Note</TooltipContent>
          </Tooltip>
        ) : (
          <Button className="w-full" onClick={onCreateNote}>
            <Plus className="size-5" />
            Create Note
          </Button>
        )}
      </div>

      {/* Scrollable nav groups */}
      <div className={cn("flex-1 overflow-y-auto", collapsed && "flex flex-col items-center")}>
        <NavGroupLabel collapsed={collapsed}>Workspace</NavGroupLabel>
        <NavList items={navGroups.workspace} pathname={pathname} onNavigate={onNavigate} collapsed={collapsed} />

        <NavGroupLabel collapsed={collapsed}>Tools</NavGroupLabel>
        <NavList items={toolsItems} pathname={pathname} onNavigate={onNavigate} collapsed={collapsed} />

        {navGroups.admin.length > 0 && (
          <>
            <NavGroupLabel collapsed={collapsed}>Admin</NavGroupLabel>
            <NavList items={navGroups.admin} pathname={pathname} onNavigate={onNavigate} collapsed={collapsed} />
          </>
        )}
      </div>

      {/* Bottom-pinned: Settings & Help */}
      <div className={cn("border-t border-border py-2", collapsed && "flex flex-col items-center")}>
        <NavList
          items={[{ text: "Settings", icon: Settings, path: "/settings" }]}
          pathname={pathname}
          onNavigate={onNavigate}
          collapsed={collapsed}
        />
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onHelp}
                className="mt-1 flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <HelpCircle className="size-5 shrink-0" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Help &amp; Feedback</TooltipContent>
          </Tooltip>
        ) : (
          <nav className="flex flex-col gap-1 px-2">
            <button
              onClick={onHelp}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <HelpCircle className="size-4.5 shrink-0" />
              Help &amp; Feedback
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}

const AppLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const { mode, toggleColorMode } = useAppTheme();
  const { isOnline } = useNetworkStatus();
  const { settings } = usePlatformSettings();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);

  const navGroups = useNavGroups();
  const aiEnabled = settings?.ai?.enableAI !== false;

  const isViewingNote =
    pathname.startsWith("/note/") ||
    pathname.startsWith("/public/note/") ||
    pathname === "/note/new";

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const goTo = (path) => {
    router.push(path);
    setMobileNavOpen(false);
  };

  const pathnames = pathname.split("/").filter(Boolean);
  const initial = currentUser?.displayName?.charAt(0) || "U";

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Mobile nav sheet — always shows the full labeled nav */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigate</SheetTitle>
          </SheetHeader>
          <SidebarNav
            currentUser={currentUser}
            initial={initial}
            mode={mode}
            toggleColorMode={toggleColorMode}
            navGroups={navGroups}
            pathname={pathname}
            onNavigate={goTo}
            onCreateNote={() => goTo("/note/new")}
            onHelp={() => setHelpDialogOpen(true)}
            onLogout={handleLogout}
            onOpenAI={() => setPromptModalOpen(true)}
            aiEnabled={aiEnabled}
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onSearchSubmit={handleSearchSubmit}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar — always visible, toggles between full width and icon rail */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-30 hidden shrink-0 flex-col overflow-hidden border-r border-border bg-background transition-[width] duration-200 md:flex",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <SidebarNav
          currentUser={currentUser}
          initial={initial}
          mode={mode}
          toggleColorMode={toggleColorMode}
          navGroups={navGroups}
          pathname={pathname}
          onNavigate={goTo}
          onCreateNote={() => router.push("/note/new")}
          onHelp={() => setHelpDialogOpen(true)}
          onLogout={handleLogout}
          onOpenAI={() => setPromptModalOpen(true)}
          aiEnabled={aiEnabled}
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          onSearchSubmit={handleSearchSubmit}
          onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
          collapsed={sidebarCollapsed}
        />
      </aside>

      {/* Main content */}
      <main
        className={cn(
          "flex min-h-screen w-full flex-1 flex-col px-3 pt-4 sm:px-6 md:px-8",
          isViewingNote ? "pb-6" : "pb-28 md:pb-8",
          sidebarCollapsed ? "md:pl-16" : "md:pl-64"
        )}
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top, 0px))" }}
      >
        {/* Mobile-only top bar: menu trigger, since there is no persistent header */}
        <div className="mb-3 flex items-center justify-between md:hidden">
          <button
            onClick={() => setMobileNavOpen(true)}
            aria-label="open navigation menu"
            className="rounded-lg p-2 text-foreground hover:bg-muted"
          >
            <MenuIcon />
          </button>
          <Link href="/dashboard" className="flex select-none items-center gap-2">
            <Image
              src="/logo.svg"
              alt="OpenNotes"
              width={28}
              height={28}
              className="rounded-md"
            />
            <span className="text-base font-extrabold tracking-tight text-foreground">
              OpenNotes
            </span>
          </Link>
          <div className="size-9" />
        </div>

        <div className="mx-auto w-full max-w-360">
          {!isOnline && (
            <div className="mb-5 flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-500/15">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                Offline Mode Active — all note reads, creates, and edits are
                stored locally and will auto-sync once you&apos;re back
                online.
              </p>
            </div>
          )}

          {pathnames.length > 0 && (
            <div className="mb-4 px-10 hidden items-center gap-1.5 text-sm text-muted-foreground md:flex">
              <button
                onClick={() => router.push("/dashboard")}
                className="font-medium hover:text-foreground"
              >
                Home
              </button>
              {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join("/")}`;
                return (
                  <span key={to} className="flex items-center gap-1.5">
                    <span>/</span>
                    {last ? (
                      <span className="font-semibold text-foreground capitalize">
                        {value}
                      </span>
                    ) : (
                      <button
                        onClick={() => router.push(to)}
                        className="capitalize hover:text-foreground"
                      >
                        {value}
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          )}

          {settings?.general?.maintenanceMode && !isSuperAdmin(currentUser) ? (
            <div className="my-4 rounded-2xl border border-amber-300 bg-amber-50 p-8 text-center dark:border-amber-500/30 dark:bg-amber-500/15">
              <h2 className="text-xl font-extrabold text-amber-800 dark:text-amber-300">
                Platform Maintenance Mode
              </h2>
              <p className="mx-auto mt-2 max-w-150 text-muted-foreground">
                {settings?.general?.maintenanceMessage ||
                  "OpenNotes is currently undergoing scheduled platform maintenance. Please check back shortly."}
              </p>
            </div>
          ) : (
            <div className="px-10">
              {children}
              </div>
          )}
        </div>
      </main>

      {/* Mobile floating bottom nav */}
      {!isViewingNote && (
        <div
          className="fixed left-1/2 z-40 flex h-18 w-[calc(100%-40px)] max-w-105 -translate-x-1/2 items-center rounded-[28px] border border-border bg-background/85 px-2 shadow-lg backdrop-blur-xl md:hidden"
          style={{ bottom: "max(8px, env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="flex w-full items-center justify-around">
            {BOTTOM_NAV_ITEMS.map((tab) => {
              const isSelected = Boolean(tab.path) && pathname === tab.path;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.label}
                  onClick={() => (tab.action === "menu" ? setMobileNavOpen(true) : router.push(tab.path))}
                  className={cn(
                    "flex h-full flex-1 flex-col items-center justify-center gap-0.5 rounded-[20px] py-1 transition-transform active:scale-95",
                    isSelected
                      ? "bg-primary/12 text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-5.5 transition-transform",
                      isSelected && "scale-110"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px]",
                      isSelected ? "font-bold" : "font-medium opacity-75"
                    )}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <PromptBuilderModal
        open={promptModalOpen}
        onClose={() => setPromptModalOpen(false)}
      />

      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Help &amp; Feedback</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Need assistance or have feedback about OpenNotes? We are here to
            help!
          </p>
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm font-bold">Documentation &amp; Guides</p>
              <p className="text-xs text-muted-foreground">
                Learn how to make the most of rich text HTML note taking.
              </p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm font-bold">Contact Support</p>
              <p className="text-xs text-muted-foreground">
                Send us an email at support@opennotes.app
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={() => setHelpDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <OnboardingWizardModal />
    </div>
  );
};

export default AppLayout;
