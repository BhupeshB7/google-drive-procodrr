import {
    File,
    FileText,
    FileImage,
    FileVideo,
    FileArchive,
    FileCode,
    FileAudio,
    FileSpreadsheet,
  } from "lucide-react";
  
  export default function getFileIcon(filename) {
    const ext = filename.split(".").pop().toLowerCase();
  
    switch (ext) {
      case "pdf":
      case "doc":
      case "docx":
      case "txt":
        return <FileText className="w-6 h-6 text-blue-500" />;
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "webp":
        return <FileImage className="w-6 h-6 text-purple-500" />;
      case "mp4":
      case "mov":
      case "avi":
      case "mkv":
        return <FileVideo className="w-6 h-6 text-red-500" />;
      case "zip":
      case "rar":
      case "tar":
      case "gz":
        return <FileArchive className="w-6 h-6 text-yellow-500" />;
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
      case "html":
      case "css":
      case "py":
      case "java":
      case "c":
      case "cpp":
        return <FileCode className="w-6 h-6 text-green-500" />;
      case "mp3":
      case "wav":
      case "ogg":
        return <FileAudio className="w-6 h-6 text-indigo-500" />;
      case "xls":
      case "xlsx":
        return <FileSpreadsheet className="w-6 h-6 text-green-600" />;
      default:
        return <File className="w-6 h-6 text-gray-500" />;
    }
  }
  