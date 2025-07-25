import { useEffect, useRef } from "react";

function CreateDirectoryModal({
  newDirname,
  setNewDirname,
  onClose,
  onCreateDirectory,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  const handleOverlayClick = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={handleOverlayClick}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl transition-all duration-300"
        onClick={handleContentClick}
      >
        <h2 className="text-2xl font-semibold text-center mb-4 my-6 text-gray-800 dark:text-white">
          Create New Folder
        </h2>

        <form onSubmit={onCreateDirectory} className="space-y-4">
          <div>
            <label
              htmlFor="new-dir-name"
              className="block text-md font-medium text-gray-600 dark:text-gray-300 my-3"
            >
              📂 Folder Name
            </label>
            <input
              id="new-dir-name"
              ref={inputRef}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              placeholder="e.g. Documents"
              value={newDirname}
              onChange={(e) => setNewDirname(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 py-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600  hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 rounded-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 rounded-none shadow-sm transition-all duration-200"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateDirectoryModal;
