 import Fuse from "fuse.js";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { File, Folder, Search, X, XCircle } from "lucide-react";
import { fetchSearchResults } from "@/api/fileDirectoryApi";

const FuzzySearchBar = () => {
  const [allData, setAllData] = useState([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetchSearchResults();
      setAllData(response);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  const fuse = useMemo(() => {
    return new Fuse(allData, {
      keys: ["name"],
      threshold: 0.4,
    });
  }, [allData]);

  useEffect(() => {
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }
    const fuseResults = fuse.search(query).map((result) => result.item);
    setSearchResults(fuseResults);
  }, [query, fuse]);

  const handleClick = (item) => {
    if (item.type === "file") {
      navigate(`/file/${item._id}`);
    } else {
      navigate(`/directory/${item._id}`);
    }
    setQuery("");
    setSearchResults([]);
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };
  function getIcon(name) {
    if (name === "file") {
      return <File className="w-5 h-5" />;
    } else {
      return <Folder className="w-5 h-5" />;
    }
  }
  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search files or folders..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-3 pr-10 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        {!query && (
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        )}
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-300 hover:text-red-500"
          >
            <X />
          </button>
        )}
      </div>

      {query.trim() !== "" && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg z-50 max-h-120 overflow-y-auto shadow-lg border border-gray-200 dark:border-gray-700">
          {searchResults.length > 0 ? (
            searchResults.map((item) => (
              <div
                key={item._id}
                onClick={() => handleClick(item)}
                tabIndex={0}
                className="  px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                  {getIcon(item.type)}
                  <span>{item.name}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center gap-2">
              <XCircle className="w-8 h-8 text-red-400 dark:text-red-300" />
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                No results found
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Try a different keyword or check your spelling.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FuzzySearchBar;
