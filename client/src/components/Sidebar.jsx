// Sidebar.jsx
import {
    Plus,
    Folder,
    Star,
    Trash,
    Share2,
    Clock,
    HardDrive, 
    Upload,
    PieChart,
  } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { handleCreateDirectory } from "@/api/fileDirectoryApi";
  import { useParams, Link, useLocation } from "react-router-dom"; 
  import CreateDirectoryModal from "./CreateDirectoryModal";
  import { useState } from "react";
  import FileUpload from "./FileUpload";
  import { useDirectoryContext } from "@/contexts/DirectoryContext";
  
  // Reusable nav item
  const NavItem = ({ icon: Icon, label, to = "#", active = false }) => (
    <Link to={to}>
      <div
        className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
          active
            ? "bg-[var(--google-blue-light)] text-[var(--sidebar-primary)] border border-[var(--google-blue-light)] shadow-sm"
            : "text-[var(--sidebar-foreground)] hover:bg-[var(--surface-variant)] hover:text-[var(--foreground)]"
        }`}
      >
        <Icon
          className={`w-5 h-5 ${
            active ? "text-[var(--sidebar-primary)]" : "text-gray-500"
          }`}
        />
        <span className="font-medium text-sm">{label}</span>
      </div>
    </Link>
  );
  
  const Sidebar = () => {
    const { parentId } = useParams();
    const location = useLocation();
    const { refetch } = useDirectoryContext(parentId);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDirname, setNewDirname] = useState("");
  
    const handleModalCreate = async (e) => {
      e.preventDefault();
      const success = await handleCreateDirectory(parentId, newDirname, refetch);
      if (success) {
        setNewDirname("");
        setIsModalOpen(false); 
      }
    };
  
    return (
      <div className="flex flex-col h-full bg-[var(--sidebar)] min-w-[240px]">
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
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full h-12 bg-[var(--primary)] hover:bg-[var(--google-blue-hover)] text-[var(--primary-foreground)] rounded-xl shadow-sm transition-all duration-200 flex items-center gap-3 font-medium"
          >
            <Plus className="w-5 h-5" />
            New
          </Button>
        </div>
  
        {/* Navigation */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="space-y-1">
            <NavItem icon={Clock} label="Recent" to="/recent" active={location.pathname === "/recent"} />
            <NavItem icon={Star} label="Starred" to="/starred" active={location.pathname === "/starred"} />
            <NavItem icon={Trash} label="Trash" to="/trash" active={location.pathname === "/trash"} />
          </div>
  
          <div className="pt-6 border-t border-[var(--border)] mt-6">
            <div className="text-xs font-medium text-[var(--muted-foreground)] mb-3 px-3">
              QUICK ACCESS
            </div>
            <NavItem icon={PieChart} label="File Analytics" to="/analytics" active={location.pathname === "/analytics"} />
          </div>
  
          <FileUpload parentDirId={parentId} onUploadSuccess={refetch} />
        </div>
  
        {/* Create Folder Modal */}
        {isModalOpen && (
          <CreateDirectoryModal
            onClose={() => setIsModalOpen(false)}
            newDirname={newDirname}
            setNewDirname={setNewDirname}
            onCreateDirectory={handleModalCreate}
          />
        )}
      </div>
    );
  };
  
  export default Sidebar;
  