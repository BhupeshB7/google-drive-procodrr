import { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { File, Folder, Loader2 } from "lucide-react";

const DetailsModal = ({ isOpen, onClose, type, id }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id || !isOpen) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const url =
          type === "file"
            ? `http://localhost:3000/api/files/fileDetails/${id}`
            : `http://localhost:3000/api/directory/details/${id}`;
        const res = await axios.get(url, { withCredentials: true });
        setDetails(res.data[type + "Details"]);
      } catch (err) {
        console.error("Error fetching details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, isOpen, type]);

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between border-b border-gray-300 dark:border-muted pb-2">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg rounded-xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold">
            {type === "file" ? (
              <File className="h-5 w-5 text-primary" />
            ) : (
              <Folder className="h-5 w-5 text-primary" />
            )}
            {details ? details.name : "Details"}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3 text-muted-foreground">
            <Loader2 className="animate-spin w-6 h-6" />
            <p>Fetching details...</p>
          </div>
        ) : details ? (
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            {type === "file" && (
              <>
                <InfoRow label="Extension" value={details.extension} />
                <InfoRow label="Type" value={details.type} />
                <InfoRow
                  label="Size"
                  value={`${(details.size / 1024).toFixed(2)} KB`}
                />
                <InfoRow
                  label="Uploaded"
                  value={new Date(details.uploadDate).toLocaleString()}
                />
                <InfoRow
                  label="Last Viewed"
                  value={new Date(details.recentView).toLocaleString()}
                />
                <InfoRow
                  label="Starred"
                  value={details.isStarred ? "Yes ⭐" : "No"}
                />
                <InfoRow
                  label="Sharing"
                  value={
                    details.isLinkSharingEnabled
                      ? "Link Enabled 🔗"
                      : "Private 🔒"
                  }
                />
              </>
            )}
            {type === "folder" && (
              <>
                <InfoRow
                  label="Created"
                  value={new Date(details.createdAt).toLocaleString()}
                />
                <InfoRow label="Total Items" value={details.totalItems} />
                <InfoRow label="Type" value="File/Folder" />
                <InfoRow label="Owner" value={details.owner} />
                <InfoRow
                  label="Total Size"
                  value={`${(details.totalSize / 1024 / 1024).toFixed(2)} MB`}
                />
                <InfoRow label="Total Files" value={details.totalFiles} />
                <InfoRow
                  label="Total Subfolders"
                  value={details.totalSubfolders}
                />
                 
              </>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-6">
            Something went wrong. Try again.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DetailsModal;
