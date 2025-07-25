import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Menu,
  Plus,
  Folder,
  Star,
  Trash,
  Share2,
  Clock,
  HardDrive,
  Settings,
  Upload,
  Search,
  Grid3X3,
  List,
} from "lucide-react";

// Reusable navigation item
const NavItem = ({ icon: Icon, label, active = false }) => (
  <div
    className={`
    flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200
    ${
      active
        ? "bg-[var(--google-blue-light)] text-[var(--sidebar-primary)] border border-[var(--google-blue-light)] shadow-sm"
        : "text-[var(--sidebar-foreground)] hover:bg-[var(--surface-variant)] hover:text-[var(--foreground)]"
    }
  `}
  >
    <Icon
      className={`w-5 h-5 ${
        active ? "text-[var(--sidebar-primary)]" : "text-gray-500"
      }`}
    />
    <span className="font-medium text-sm">{label}</span>
  </div>
);

// Sidebar component
const SidebarContent = () => (
  <div className="flex flex-col h-full  bg-[var(--sidebar)] min-w-[240px] ">
    {/* Logo */}
    <div className="p-6 border-b border-[var(--border)]">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
          <HardDrive className="w-5 h-5 text-[var(--primary-foreground)]" />
        </div>
        <span className="text-xl font-semibold text-[var(--foreground)]">
          Drive
        </span>
      </div>
    </div>

    {/* New Button */}
    <div className="p-4 border-b border-[var(--border)]">
      <Button className="w-full h-12 bg-[var(--primary)] hover:bg-[var(--google-blue-hover)] text-[var(--primary-foreground)] rounded-xl shadow-sm transition-all duration-200 flex items-center gap-3 font-medium">
        <Plus className="w-5 h-5" />
        New
      </Button>
    </div>

    {/* Nav Items */}
    <div className="flex-1 px-3 py-4 space-y-1">
      <div className="space-y-1">
        <NavItem icon={Share2} label="Shared with me" />
        <NavItem icon={Clock} label="Recent" />
        <NavItem icon={Star} label="Starred" />
        <NavItem icon={Trash} label="Trash" />
      </div>

      <div className="pt-6 border-t border-[var(--border)] mt-6">
        <div className="text-xs font-medium text-[var(--muted-foreground)] mb-3 px-3">
          QUICK ACCESS
        </div>
        <NavItem icon={Upload} label="Uploads" />
        <NavItem icon={Settings} label="Settings" />
      </div>
    </div>
  </div>
);

// Dashboard Page
const Dashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  return (
    <div className="max-h-screen flex overflow-hidden bg-[var(--background)]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-72 border-r border-[var(--border)] bg-[var(--sidebar)] shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerTrigger asChild className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-20 left-4 z-50   shadow-md hover:shadow-lg border border-[var(--border)]"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </DrawerTrigger>
        <DrawerContent side="left" className="p-0 w-72 h-full">
          <SidebarContent />
        </DrawerContent>
      </Drawer>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[var(--card)] border-b border-[var(--border)] px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="lg:hidden w-10"></div>
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search in Drive"
                  className="w-full pl-12 pr-4 py-3 bg-[var(--surface-variant)] rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:bg-[var(--card)] transition-all duration-200"
                />
              </div>
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-2 bg-[var(--surface-variant)] rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`w-8 h-8 p-0 ${
                  viewMode === "grid" ? "bg-[var(--card)] shadow-sm" : ""
                }`}
              >
                <Grid3X3 className="w-4 h-4 text-[var(--foreground)]" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={`w-8 h-8 p-0 ${
                  viewMode === "list" ? "bg-[var(--card)] shadow-sm" : ""
                }`}
              >
                <List className="w-4 h-4 text-[var(--foreground)]" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
                My Drive
              </h1>
              <p className="text-[var(--muted-foreground)]">
                Store, sync, and share your files
              </p>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-32 h-32 bg-[var(--surface-variant)] rounded-full flex items-center justify-center mb-6">
                <Folder className="w-16 h-16 text-gray-400" />
              </div>

              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-3">
                Google Drive
              </h2>

              <p className="text-[var(--muted-foreground)] text-center max-w-md mb-8">
                Your drive is empty. Upload files or create new documents to get
                started.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-[var(--primary)] hover:bg-[var(--google-blue-hover)] text-[var(--primary-foreground)] px-6 py-3 rounded-xl font-medium shadow-sm transition-all duration-200">
                  <Plus className="w-5 h-5 mr-2" />
                  New File
                </Button>
                <Button
                  variant="outline"
                  className="px-6 py-3 rounded-xl font-medium border-[var(--border)] hover:bg-[var(--surface-variant)] transition-all duration-200"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Files
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
