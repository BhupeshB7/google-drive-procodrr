import { useAuth } from "@/contexts/AuthContext";
import React, { useState } from "react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Mail, Users } from "lucide-react";

const ShareModal = ({ isOpen, onClose, handleGenerate }) => {
  const [email, setEmail] = useState("");
  const [accessMode, setAccessMode] = useState("viewer");
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-black dark:text-gray-300 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-2xl font-semibold text-center mb-6">Share File</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Recipient Email
            </label>
            <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
              <div className="p-2 pl-3">
                <Mail className="w-5 h-5 text-gray-500" />
              </div>
              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 py-2 px-3 outline-none bg-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Access Level
            </label>
            <select
              value={accessMode}
              onChange={(e) => setAccessMode(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
          </div>

          <div className="pt-4">
            <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" /> People with access
            </h4>
            <div className="space-y-3">
              {/* Owner */}
              <UserAccess name={user?.name} role="Owner" img={user?.image} />

              {/* Dummy 1 */}
              <UserAccess
                name="Aarav Mehta"
                role="Editor"
                img="https://i.pravatar.cc/150?img=64"
              />

              {/* Dummy 2 */}
              <UserAccess
                name="Ramesh"
                role="Viewer"
                img="https://i.pravatar.cc/150?img=53"
              />
            </div>
          </div>

          <button
            onClick={() => handleGenerate(email, accessMode)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition duration-200"
          >
            Generate Link
          </button>
        </div>
      </div>
    </div>
  );
};

const UserAccess = ({ name, role, img }) => (
  <div className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-md p-3">
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src={img} className="w-9 h-9 rounded-full" />
      </Avatar>
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-xs text-gray-500 capitalize">{role}</p>
      </div>
    </div>
    {role.toLowerCase() !== "owner" && (
      <button className="text-sm text-blue-600 hover:underline">Remove</button>
    )}
  </div>
);

export default ShareModal;
