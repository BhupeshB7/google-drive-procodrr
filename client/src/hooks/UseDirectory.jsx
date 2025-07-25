import { useEffect, useState, useCallback } from "react";
import { fetchDirectory } from "../api/fileDirectoryApi";

export const useDirectory = (parentId) => {
  const [directory, setDirectory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allFiles, setAllFiles] = useState([]);
  const loadDirectory = useCallback(async () => {
    setLoading(true);
    try {
      const dirs = await fetchDirectory(parentId);
      const filteredFiles =
        dirs?.files?.filter((file) => !file.isDeleted) || [];
      setAllFiles(filteredFiles);
      setDirectory(dirs.directories);
    } catch (err) {
      setDirectory([]);
    } finally {
      setLoading(false);
    }
  }, [parentId]);

  useEffect(() => {
    loadDirectory();
  }, [loadDirectory]);

  return { directory, loading, refetch: loadDirectory, allFiles };
};
