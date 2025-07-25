import { allTrashFiles } from "@/api/fileDirectoryApi";
import LoadingSpinner from "@/components/LoadingSpinner";
import Navbar from "@/components/Navbar";
import {
  ArrowLeftSquare,
  Trash2,
  EllipsisVertical,
  RotateCcw,
  FileText,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Trash = () => {
  const [trashFiles, setTrashFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalFiles, setTotalFiles] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrashFiles(currentPage, sortOption);
  }, [currentPage, sortOption]);

  const fetchTrashFiles = async (page, sortBy) => {
    setLoading(true);
    try {
      const res = await allTrashFiles(page, itemsPerPage, sortBy);
      console.log(res);
      setTrashFiles(res.data);
      setTotalFiles(res.total);
      setTotalPages(res.pages);
    } catch (error) {
      // already handled in allTrashFiles
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => navigate(-1);

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1);
  };

  if (loading) return <LoadingSpinner />;
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--background)] dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          {/* Back Button */}
          <button
            onClick={goBack}
            className="inline-flex items-center gap-2 text-[var(--google-blue)] hover:text-[var(--google-blue-hover)] dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 group"
          >
            <ArrowLeftSquare className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Back</span>
          </button>

          {/* Header Section */}
          <div className="bg-[var(--card)] dark:bg-gray-900 rounded-xl border border-[var(--border)] dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)] dark:text-white">
                  Trash
                </h1>
                <p className="text-[var(--muted-foreground)] dark:text-gray-400 mt-1">
                  Manage your deleted files and folders
                </p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <span className="font-semibold">Important:</span> Files will be
                permanently deleted after{" "}
                <span className="font-bold text-red-600 dark:text-red-400">
                  30 days
                </span>
                . Restore them before they're gone forever.
              </p>
            </div>
          </div>

          {/* Controls Section */}
          <div className="bg-[var(--card)] dark:bg-gray-900 rounded-xl border border-[var(--border)] dark:border-gray-800 p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--foreground)] dark:text-white">
                  {totalFiles} files in trash
                </span>
                {trashFiles.length > 0 && (
                  <span className="text-xs text-[var(--muted-foreground)] dark:text-gray-400">
                    (showing {trashFiles.length} of {totalFiles})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="sort"
                  className="text-sm font-medium text-[var(--foreground)] dark:text-white"
                >
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={sortOption}
                  onChange={handleSortChange}
                  className="bg-[var(--surface)] dark:bg-gray-800 border border-[var(--border)] dark:border-gray-700 text-[var(--foreground)] dark:text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--google-blue)] focus:border-transparent transition-all duration-200"
                >
                  <option value="recent">Recently Deleted</option>
                  <option value="name">File Name</option>
                </select>
              </div>
            </div>
          </div>

          {/* Files Table or Empty State */}
          {trashFiles.length > 0 ? (
            <div className="bg-[var(--card)] dark:bg-gray-900 rounded-xl border border-[var(--border)] dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-[var(--surface-variant)] dark:bg-gray-800 border-b border-[var(--border)] dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted-foreground)] dark:text-gray-300 uppercase tracking-wider">
                        File Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted-foreground)] dark:text-gray-300 uppercase tracking-wider">
                        Parent Folder
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted-foreground)] dark:text-gray-300 uppercase tracking-wider">
                        Deleted On
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--muted-foreground)] dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[var(--card)] dark:bg-gray-900 divide-y divide-[var(--border)] dark:divide-gray-800">
                    {trashFiles.map((fileItem) => (
                      <tr
                        key={fileItem._id}
                        className="hover:bg-[var(--surface)] dark:hover:bg-gray-800 transition-colors duration-150"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-[var(--foreground)] dark:text-white truncate">
                                {fileItem.name}
                              </p>
                              <p className="text-xs text-[var(--muted-foreground)] dark:text-gray-400 uppercase">
                                {fileItem.extension}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                            {fileItem.parentDirName}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-[var(--foreground)] dark:text-white">
                            {new Date(fileItem.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-[var(--muted-foreground)] dark:text-gray-400">
                            {new Date(fileItem.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--surface-variant)] dark:hover:bg-gray-700 transition-colors duration-150">
                                <EllipsisVertical className="w-4 h-4 text-[var(--muted-foreground)] dark:text-gray-400" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48 bg-[var(--card)] dark:bg-gray-800 border-[var(--border)] dark:border-gray-700"
                            >
                              <DropdownMenuItem
                                onClick={() =>
                                  window.open(`/file/${fileItem._id}`, "_blank")
                                }
                                className="text-[var(--foreground)] dark:text-white hover:bg-[var(--surface)] dark:hover:bg-gray-700"
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Open File
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  alert(`Restore file: ${fileItem.name}`)
                                }
                                className="text-[var(--google-blue)] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Restore
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  alert(`Delete file: ${fileItem.name}`)
                                }
                                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Forever
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--card)] dark:bg-gray-900 rounded-xl border border-[var(--border)] dark:border-gray-800 shadow-sm">
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                  <Trash2 className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] dark:text-white mb-2">
                  Trash is Empty
                </h3>
                <p className="text-[var(--muted-foreground)] dark:text-gray-400 text-center max-w-md">
                  When you delete files, they'll appear here for 30 days before
                  being permanently removed.
                </p>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <nav className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        currentPage === page
                          ? "bg-[var(--google-blue)] text-white shadow-sm"
                          : "text-[var(--foreground)] dark:text-white hover:bg-[var(--surface)] dark:hover:bg-gray-800 border border-[var(--border)] dark:border-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </nav>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Trash;
