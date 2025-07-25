import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeftSquare,
  Download,
  File,
  Folder,
  Info,
  Link2,
  Pencil,
  Plus,
  Share2,
  Star,
  Trash2,
  X,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  deleteFile,
  handleCopyLink,
  handleCreateDirectory,
  handleDeleteDir,
  handleRenameDirOrFile,
  handleStarred,
  bulkDelete, // New dummy API function
} from "@/api/fileDirectoryApi";
import { useState, useEffect } from "react";
import CreateDirectoryModal from "@/components/CreateDirectoryModal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import RenameModal from "@/components/RenameModal";
import FileUpload from "@/components/FileUpload";
import { useDirectoryContext } from "@/contexts/DirectoryContext";
import getFileIcon from "@/utils/getFileIcon";
import ShareModal from "@/components/ShareModal";
import FuzzySearchBar from "@/components/FuzzySearchBar";
import DetailsModal from "@/components/DetailsModal";
import Breadcrumb from "@/components/BreadCrumb";

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { parentId } = useParams();
  const navigate = useNavigate();
  const { directory, refetch, allFiles } = useDirectoryContext(parentId);
  const [newDirname, setNewDirname] = useState("");
  const [renameType, setRenameType] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameId, setRenameId] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailsType, setDetailsType] = useState("file");
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Enhanced bulk selection states
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectionType, setSelectionType] = useState(null); // 'file' or 'folder'

  // Auto-close selection mode when no items are selected
  useEffect(() => {
    if (isSelectionMode && selectedItems.size === 0) {
      setIsSelectionMode(false);
      setSelectionType(null);
    }
  }, [selectedItems, isSelectionMode]);

  const handleShowDetails = (type, id) => {
    console.log("Showing details for:", type, id);
    setSelectedItem(id);
    setDetailsType(type);
    setShowDetailsModal(true);
  };

  const handleGenerateLink = (email, mode) => {
    console.log("Generating link for:", email, "with mode:", mode);
    // TODO: Call backend or logic to generate shareable link
    setIsShareModalOpen(false);
  };

  const handleOpenRenameModalOpen = (type, id, value) => {
    setRenameType(type);
    setRenameId(id);
    setRenameValue(value);
    setIsRenameModalOpen(true);
  };

  const handleRename = async (e) => {
    e.preventDefault();
    const success = await handleRenameDirOrFile(
      renameType,
      renameId,
      renameValue,
      refetch
    );
    if (success) {
      setIsRenameModalOpen(false);
    }
  };

  const handleModalCreate = async (e) => {
    e.preventDefault();
    const success = await handleCreateDirectory(parentId, newDirname, refetch);
    if (success) {
      setNewDirname("");
      setIsModalOpen(false);
    }
  };

  // Enhanced bulk selection functions
  const enterSelectionMode = (itemType, itemId = null) => {
    setIsSelectionMode(true);
    setSelectionType(itemType);
    const newSelection = new Set();

    // If itemId is provided, auto-select it
    if (itemId) {
      newSelection.add(`${itemType}-${itemId}`);
    }

    setSelectedItems(newSelection);
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedItems(new Set());
    setSelectionType(null);
  };

  const toggleItemSelection = (itemId, itemType) => { 
    if (selectionType && itemType !== selectionType) {
      return;
    }

    const newSelection = new Set(selectedItems);
    const key = `${itemType}-${itemId}`;

    if (newSelection.has(key)) {
      newSelection.delete(key);
    } else {
      newSelection.add(key);
    }

    setSelectedItems(newSelection);
  };

  const selectAllItems = () => {
    if (!selectionType) return;

    const newSelection = new Set();

    if (selectionType === "folder") {
      directory.forEach((dir) => newSelection.add(`folder-${dir._id}`));
    } else if (selectionType === "file") {
      allFiles.forEach((file) => newSelection.add(`file-${file._id}`));
    }

    setSelectedItems(newSelection);
  };

  const isItemSelected = (itemId, itemType) => {
    return selectedItems.has(`${itemType}-${itemId}`);
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    const confirm = window.confirm(
      `Are you sure you want to delete ${selectedItems.size} item(s)?`
    );
    if (!confirm) return;
    const filesToDelete = [];

    selectedItems.forEach((item) => {
      const [type, id] = item.split("-");
      if (type === "file") {
        filesToDelete.push(id);
      }
    });

    try { 
      const success = await bulkDelete(filesToDelete);
      if (success) {
        refetch();
        exitSelectionMode();
      }
    } catch (error) {
      console.error("Bulk delete failed:", error);
    }
  };

 
  const canSelectItem = (itemType) => {
    return !isSelectionMode || !selectionType || selectionType === itemType;
  };

  return (
    <main>
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
          My Drive
        </h1>
        <p className="text-[var(--muted-foreground)]">
          Store, sync, and share your files
        </p>
      </div>
      <FuzzySearchBar />

      
      {/* Enhanced Selection Mode Header */}
      {isSelectionMode && (
        <div className="flex items-center justify-between p-4 mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={exitSelectionMode}
              className="text-gray-600"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <span className="text-sm font-medium">
              {selectedItems.size}{" "}
              {selectionType === "file" ? "file" : "folder"}(s) selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={selectAllItems}
              className="text-blue-600"
            >
              Select All {selectionType === "file" ? "Files" : "Folders"}
            </Button>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={selectedItems.size === 0}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete Selected ({selectedItems.size})
          </Button>
        </div>
      )}
      <Breadcrumb currentDirId={parentId}    />
      <div className="flex justify-between mb-4">
        {directory.length > 0 && (
          <h3 className="text-xl font-semibold text-[var(--foreground)]">
            Current Directory
          </h3>
        )}
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {directory.map((dir) => (
            <div
              key={dir?._id}
              className={`relative p-4 rounded-lg bg-[var(--card)] hover:bg-[var(--surface-variant)] transition-colors duration-200 cursor-pointer ${
                isSelectionMode && isItemSelected(dir._id, "folder")
                  ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : ""
              } ${
                isSelectionMode && !canSelectItem("folder")
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={(e) => {
                if (isSelectionMode && canSelectItem("folder")) {
                  e.preventDefault();
                  toggleItemSelection(dir._id, "folder");
                }
              }}
            >
              {/* Selection Checkbox */}
              {isSelectionMode && canSelectItem("folder") && (
                <div className="absolute top-2 left-2 z-10">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isItemSelected(dir._id, "folder")
                        ? "bg-blue-500 border-blue-500"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {isItemSelected(dir._id, "folder") && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              )}

              <Link
                to={`/directory/${dir._id}`}
                className={`block ${
                  isSelectionMode ? "pointer-events-none" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Folder className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--foreground)]">
                      {dir?.name}
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      items
                    </p>
                  </div>
                </div>
              </Link>

              {!isSelectionMode && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                      <EllipsisVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onClick={() => enterSelectionMode("folder", dir._id)}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Select
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleOpenRenameModalOpen("folder", dir._id, dir.name)
                      }
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleShowDetails("folder", dir._id)}
                    >
                      <Info className="w-4 h-4 mr-2" />
                      Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDeleteDir(dir._id, refetch)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </div>
      </div>

      {directory.length === 0 && (
        <section className="flex flex-col items-center justify-center py-20">
          <div className="w-32 h-32 bg-[var(--surface-variant)] rounded-full flex items-center justify-center mb-6">
            <Folder className="w-16 h-16 text-gray-400" />
          </div>
          <p className="text-[var(--muted-foreground)] text-center max-w-md mb-8">
            Your drive have no folder. create new !
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-[var(--primary)] hover:bg-[var(--google-blue-hover)] text-[var(--primary-foreground)] px-6 py-3 rounded-xl font-medium shadow-sm transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Folder
            </Button>
          </div>
        </section>
      )}

      {/* Files Section */}
      <div className="mt-16 space-y-4">
        {allFiles.length > 0 && (
          <h3 className="text-xl font-semibold text-[var(--foreground)]">
            All Files
          </h3>
        )}
        <div className="space-y-2">
          {allFiles &&
            allFiles.map((fileItem) => (
              <div
                key={fileItem._id}
                className={`relative p-4 border border-[var(--border)] rounded-lg bg-[var(--card)] hover:bg-[var(--surface-variant)] transition-colors duration-200 cursor-pointer ${
                  isSelectionMode && isItemSelected(fileItem._id, "file")
                    ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : ""
                } ${
                  isSelectionMode && !canSelectItem("file")
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={(e) => {
                  if (isSelectionMode && canSelectItem("file")) {
                    e.preventDefault();
                    toggleItemSelection(fileItem._id, "file");
                  }
                }}
              >
                {/* Selection Checkbox */}
                {isSelectionMode && canSelectItem("file") && (
                  <div className="absolute top-3 left-3 z-10">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isItemSelected(fileItem._id, "file")
                          ? "bg-blue-500 border-blue-500"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      {isItemSelected(fileItem._id, "file") && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                )}

                <Link
                  to={`/file/${fileItem._id}`}
                  className={`block ${
                    isSelectionMode ? "pointer-events-none" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(fileItem.name)}
                    <div>
                      <p className="font-medium text-[var(--foreground)]">
                        {fileItem.name}
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {fileItem.extension}
                      </p>
                    </div>
                  </div>
                </Link>

                {!isSelectionMode && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                        <EllipsisVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 space-y-1">
                      <DropdownMenuItem
                        onClick={() => enterSelectionMode("file", fileItem._id)}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Select
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleOpenRenameModalOpen(
                            "file",
                            fileItem._id,
                            fileItem.name
                          )
                        }
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleShowDetails("file", fileItem._id)}
                      >
                        <Info className="w-4 h-4 mr-2" />
                        Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStarred(fileItem._id, refetch)}
                      >
                        <Star
                          className={`w-4 h-4 mr-2 ${
                            fileItem.isStarred
                              ? "text-gray-500 fill-gray-500"
                              : "text-gray-500"
                          }`}
                        />
                        {fileItem.isStarred
                          ? "Remove from Starred"
                          : "Add to Starred"}
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-48">
                          <DropdownMenuItem
                            onClick={() => setIsShareModalOpen(true)}
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleCopyLink(fileItem._id)}
                          >
                            <Link2 className="w-4 h-4 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuItem
                        onClick={() =>
                          (window.location.href = `http://localhost:3000/api/files/${fileItem.id}?action=download`)
                        }
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => deleteFile(fileItem._id, refetch)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
        </div>
      </div>

      {allFiles.length === 0 && directory.length > 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-32 h-32 bg-[var(--surface-variant)] rounded-full flex items-center justify-center mb-6">
            <File className="w-16 h-16 text-gray-400" />
          </div>
          <p className="text-[var(--muted-foreground)] text-center max-w-md mb-8">
            Your drive is empty. upload files to get started.
          </p>
          <FileUpload parentDirId={parentId} onUploadSuccess={refetch} />
        </div>
      )}

      {/* Modals */}
      {isModalOpen && (
        <CreateDirectoryModal
          onClose={() => setIsModalOpen(false)}
          newDirname={newDirname}
          setNewDirname={setNewDirname}
          onCreateDirectory={handleModalCreate}
        />
      )}
      {isShareModalOpen && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          handleGenerate={handleGenerateLink}
        />
      )}
      {isRenameModalOpen && (
        <RenameModal
          renameType={renameType}
          renameValue={renameValue}
          setRenameValue={setRenameValue}
          onClose={() => setIsRenameModalOpen(false)}
          onRenameSubmit={handleRename}
        />
      )}
      {showDetailsModal && selectedItem && (
        <DetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          type={detailsType}
          id={selectedItem}
        />
      )}
    </main>
  );
};

export default Dashboard;
