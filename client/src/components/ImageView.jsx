import React, { useState, useRef } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";

const ImageView = ({ src, alt, zoomOnClick = true }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [transformOrigin, setTransformOrigin] = useState("center center");
  const imageRef = useRef(null);

  const handleImageClick = (e) => {
    if (!zoomOnClick) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setTransformOrigin(`${x}% ${y}%`);
    setIsZoomed(!isZoomed);
    setZoomLevel(isZoomed ? 1 : 2);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 5));
    setIsZoomed(true);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 0.5, 1);
    setZoomLevel(newZoom);
    if (newZoom === 1) {
      setIsZoomed(false);
    }
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setIsZoomed(false);
    setTransformOrigin("center center");
  };

  return (
    <div className="space-y-2  ">
      <div className="relative inline-block">
        <div className="overflow-hidden rounded-xl ">
          <img
            ref={imageRef}
            src={src}
            alt={alt}
            className="max-h-[80vh]  object-contain cursor-pointer transition-transform duration-300"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: transformOrigin,
            }}
            onClick={handleImageClick}
          />
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 flex space-x-2 z-10">
          <button
            onClick={handleZoomIn}
            className="rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110
               bg-white bg-opacity-80 hover:bg-opacity-100
               dark:bg-gray-800 dark:bg-opacity-80 dark:hover:bg-opacity-100
               disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={zoomLevel >= 6}
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>
          <button
            onClick={handleZoomOut}
            className="rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110
               bg-white bg-opacity-80 hover:bg-opacity-100
               dark:bg-gray-800 dark:bg-opacity-80 dark:hover:bg-opacity-100
               disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={zoomLevel <= 1}
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>   
        </div>

        {/* Reset zoom hint */}
        {isZoomed && (
          <div className="absolute top-4 left-4">
            <button
              onClick={resetZoom}
              className="bg-black bg-opacity-50 text-white text-xs px-3 py-1 rounded-full hover:bg-opacity-70 transition-all duration-200"
            >
              Reset Zoom
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageView;
