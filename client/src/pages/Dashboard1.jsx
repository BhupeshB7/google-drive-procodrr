// Dashboard.jsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Menu, Plus, Folder, Upload } from "lucide-react";
import Sidebar from "@/components/Sidebar";
const Dashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <div className="h-screen flex flex-col">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-72 border-r border-[var(--border)] bg-[var(--sidebar)] shadow-sm">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerTrigger asChild className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 shadow-md hover:shadow-lg border border-[var(--border)]"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </DrawerTrigger>
        <DrawerContent side="left" className="p-0 w-72 h-full">
          <Sidebar />
        </DrawerContent>
      </Drawer>

      {/* Main Right Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-hidden">
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
          {/* Sample Content to demonstrate scrolling */}
          <div className="mt-16 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sample file cards */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div
                  key={i}
                  className="p-4 border border-[var(--border)] rounded-lg bg-[var(--card)] hover:bg-[var(--surface-variant)] transition-colors duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Folder className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--foreground)]">
                        Sample Folder {i}
                      </h3>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {i} items
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* More sample content for scrolling demonstration */}
          <div className="mt-16 space-y-4">
            <h3 className="text-xl font-semibold text-[var(--foreground)]">
              Recent Documents
            </h3>
            <div className="space-y-2">
              {Array.from({ length: 15 }, (_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg hover:bg-[var(--surface-variant)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        D
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-[var(--foreground)]">
                        Document {i + 1}.docx
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Last modified yesterday
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Open
                  </Button>
                </div>
              ))}
            </div>
          </div>
          {/*  */}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
