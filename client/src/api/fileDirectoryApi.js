import axios from "axios";
import { toast } from "sonner";

// Create axios instance with interceptor for rate limiting
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

// Response interceptor to handle rate limit errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response?.status === 429) { 
      toast.error(
        response.data.error || "Too many requests, please try again later"
      ); 
      return Promise.reject(error);
    }
 
    if (response?.status === 401) {
      toast.error("Session expired, please login again");
      if (window.location.pathname !== "/login") {
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      }
    }

    return Promise.reject(error);
  }
);

// Fetch directory content
export const fetchDirectory = async (parentId) => {
  try {
    const res = await api.get(`/directory/${parentId || ""}`);
    return res.data;
  } catch (err) {
    console.log("Error fetching directory:", err);
    toast.error(err.response?.data?.error || "Failed to load directory");
    throw err;
  }
};
export const fetchSearchResults = async () => {
    const response = await api.get("/search", {
        withCredentials: true,
    });
    return response.data.combines;
};

export const getBreadcrumbPath = async (dirId) => {
    try {
        const res = await api.get(`/directory/breadcrumb/${dirId}`);
        return res.data.path || [];
    } catch (err) {
        toast.error("Failed to load breadcrumb");
        return [];
    }
};
 
export const handleCreateDirectory = async (parentId, dirname, refetch) => {
  if (!dirname || !dirname.trim()) {
    toast.error("Folder name is required");
    return false;
  }

  try {
    const res = await api.post(`/directory/create/${parentId || ""}`, null, {
      headers: { dirname },
    });
    if (res.status === 201) {
      toast.success("Folder created successfully");
      if (refetch) refetch();
      return true;
    }
  } catch (err) {
    toast.error(
      err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to create folder"
    );
    return false;
  }
};

export const handleRenameDirOrFile = async (type, id, value, refetch) => {
  if (!value || !value.trim()) {
    toast.error(`Please enter a valid ${type} name`);
    return false;
  }
  try {
    const url =
      type === "file" ? `/files/rename/${id}` : `/directory/rename/${id}`;
    const data =
      type === "file" ? { newFileName: value } : { newDirName: value };

    const res = await api.patch(url, data);
    if (res.status === 200) {
      toast.success(`${type} renamed successfully`);
      if (refetch) refetch();
      return true;
    }
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to rename"
    );
    return false;
  }
};

export const handleDeleteDir = async (id, refetch) => {
  const result = window.confirm(`Are you sure you want to delete this folder?`);
  if (!result) return;
  try {
    const res = await api.delete(`/directory/${id}`);
    if (res.status === 200) {
      toast.success("Folder deleted successfully");
      if (refetch) refetch();
      return true;
    }
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to delete folder"
    );
    return false;
  }
};

export const deleteFile = async (fileId, refetch) => {
  const result = window.confirm("Are you sure you want to delete this file?");
  if (!result) return;
  try {
    const res = await api.delete(`/files/${fileId}`);
    if (res.status === 200) {
      if (refetch) refetch();
      toast.success("File deleted successfully");
      return true;
    }
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to delete"
    );
    return false;
  }
};

export const allTrashFiles = async (page = 1, limit = 5, sortBy = "recent") => {
  try {
    const res = await api.get(
      `/trash?page=${page}&limit=${limit}&sortBy=${sortBy}`
    );
    return res.data;
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to load trash"
    );
    throw error;
  }
};

export const getFileAnalytics = async () => {
  try {
    const res = await api.get("/files/analytics");
    return res.data;
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to load analytics"
    );
    throw error;
  }
};

export const handleStarred = async (fileId, refetch) => {
  try {
    const res = await api.patch(`/files/starred/${fileId}`, null);
    if (res.status === 200) {
      toast.success(res.data.message);
      if (refetch) refetch();
      return true;
    }
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to star file"
    );
    return false;
  }
};
 
export const bulkDelete = async (fileIds = []) => {
  try {
    console.log(fileIds);
    const res = await api.delete(`/files/bulk-delete`, {
      withCredentials: true,
      data:{
        fileIds
      },

      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.status === 200) {
      toast.success("Files deleted successfully");
      return true;
    }
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to delete"
    );
    return false;
  }
};
function copyToClipboard(text) {
  const url = `http://localhost:5173/view/${text}`;
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(url);
  }
  toast.error("Copying to clipboard failed");
  return false;
}

export const handleCopyLink = async (fileId) => {
  try {
    const res = await api.post(`/files/copy-link/${fileId}`, null);
    if (res.status === 200) {
      copyToClipboard(res.data.link);
      toast.success("Link copied to clipboard");
      return true;
    }
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to copy link"
    );
    throw error;
  }
};
