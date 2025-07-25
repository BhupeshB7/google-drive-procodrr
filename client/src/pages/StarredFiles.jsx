import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EllipsisVertical, ArrowLeft, Stars, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Navbar from "@/components/Navbar";
import getFileIcon from "@/utils/getFileIcon";
import { deleteFile, handleStarred } from "@/api/fileDirectoryApi";
import { useDirectory } from "@/hooks/UseDirectory";

const StarredFiles = () => {
  const navigate = useNavigate();
  const [starredFiles, setStarredFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { refetch } = useDirectory();

  const fetchStarredFiles = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:3000/api/files/starred?page=${page}&limit=10`,
        {
          withCredentials: true,
        }
      );
      setStarredFiles(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching starred files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStarredFiles();
  }, [page]);

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)]">
              ⭐ Starred Files
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              View and manage your starred files.
            </p>
          </div>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* File List */}
        {loading ? (
          <p className="text-center text-muted">Loading files...</p>
        ) : starredFiles.length === 0 ? (
          <>
            <div className="text-center py-16 flex flex-col items-center justify-center text-[var(--muted-foreground)]">
               <div className="w-32 h-32 bg-[var(--surface-variant)] rounded-full flex items-center justify-center mb-6">
                 <Stars className="w-16 h-16 text-gray-400" />

               </div>
              <h2 className="text-lg font-semibold mb-1">
                No Starred Files Found
              </h2>
              <p className="text-sm text-[var(--muted-foreground)] max-w-md">
                You haven’t starred any files yet. Star files to quickly access
                them from here.
              </p>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 gap-4 mb-6">
            {starredFiles.map((fileItem) => (
              <div
                key={fileItem._id}
                className="relative p-4 border border-[var(--border)] rounded-lg bg-[var(--card)] hover:bg-[var(--surface-variant)] transition-colors duration-200 cursor-pointer"
              >
                <a href={`/file/${fileItem._id}`} className="block">
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
                </a>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                      <EllipsisVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                      onClick={async () => {
                        await handleStarred(fileItem._id, refetch);
                        await fetchStarredFiles();  
                      }}
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
                    <DropdownMenuItem
                      onClick={() =>
                        (window.location.href = `http://localhost:3000/api/files/${fileItem._id}?action=download`)
                      }
                    >
                      Download
                    </DropdownMenuItem> 
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-[var(--muted-foreground)] text-sm pt-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default StarredFiles;
