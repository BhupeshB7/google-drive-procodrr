import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { Outlet, useParams } from "react-router-dom"; 
import { DirectoryProvider } from "@/contexts/DirectoryContext";
const DashboardLayout = () => {
    const {parentId} = useParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  return ( 
     <DirectoryProvider parentId={parentId}>    
         <div className="h-screen max-w-screen flex flex-col">
        {/* Navbar */}
        <header>
          <Navbar />
        </header>

        {/* Main Area: Sidebar + Content */}
        <div className="flex flex-1 overflow-hidden bg-[var(--background)]">
          {/* Sidebar (Left Panel) */}
          <aside className="hidden lg:flex lg:w-72 border-r border-[var(--border)] bg-[var(--sidebar)] shadow-sm overflow-hidden">
            <Sidebar />
          </aside>
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
          {/* Main Content (Right Panel) */}
          <main className="flex-1 overflow-y-auto p-4 scrollbar-hidden">
            <Outlet />
          </main>
        </div>
      </div> 
     </DirectoryProvider>
  );
};

export default DashboardLayout;
