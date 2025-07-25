import React, { useState, useEffect } from "react";
import { Home, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom"; 
import { getBreadcrumbPath } from "@/api/fileDirectoryApi";

const Breadcrumb = ({ currentDirId }) => {
  const [path, setPath] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentDirId) {
      fetchPath();
    } else {
      setPath([]);
    }
  }, [currentDirId]);

  const fetchPath = async () => {
    setLoading(true);
    const breadcrumb = await getBreadcrumbPath(currentDirId);
    setPath(breadcrumb);
    setLoading(false);
  };

  const handleNavigate = (dirId) => {
    if (dirId === "root") {
      navigate("/");
    } else {
      navigate(`/directory/${dirId}`);
    }
  };

  const formatName = (name) => {
    if (!name) return "Untitled";
    if (name.includes("root-") && name.includes("@")) return "Home";
    return name;
  };

  const isHome = !currentDirId || currentDirId === "root";

  if (loading) {
    return (
      <div className="flex items-center px-6 py-4 bg-white border-b border-gray-100">
        <div className="animate-pulse bg-gray-200 h-5 w-48 rounded-md"></div>
      </div>
    );
  }

  return (
    <nav className="flex items-center px-6 py-2">
      <button
        onClick={() => handleNavigate("root")}
        disabled={isHome}
        className={`flex items-center px-3 py-1 rounded-lg font-medium text-sm transition-all duration-200 ${
          isHome
            ? "bg-blue-100 text-blue-700 cursor-default"
            : "bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600"
        }`}
      >
        <Home size={16} />
        <span className="ml-2">Home</span>
      </button>

      {path?.length > 0 &&
        path.map((dir, index) => {
          const isLast = index === path.length - 1;
          const isRootDir =
            dir.name && dir.name.includes("root-") && dir.name.includes("@");

          if (isRootDir) return null;

          return (
            <React.Fragment key={dir._id}>
              <ChevronRight size={16} className="text-gray-400 mx-3" />
              <button
                onClick={() => !isLast && handleNavigate(dir._id)}
                disabled={isLast}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isLast
                    ? "bg-blue-100 text-blue-700 cursor-default"
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                {formatName(dir.name)}
              </button>
            </React.Fragment>
          );
        })}
    </nav>
  );
};

export default Breadcrumb;
