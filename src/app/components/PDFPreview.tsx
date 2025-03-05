"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiFile, FiX } from "react-icons/fi";
import { useState, useEffect } from "react";

interface PDFPreviewProps {
  file: File | null;
  onClose: () => void;
}

const PDFPreview = ({ file, onClose }: PDFPreviewProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  if (!file) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-[800px] bg-white rounded-xl shadow-lg border border-gray-200 z-50"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FiFile className="w-5 h-5 text-blue-500" />
            <span className="text-lg font-medium text-gray-700">
              {file.name}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="h-[500px] p-4">
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              className="w-full h-full rounded-lg"
              title="PDF Preview"
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PDFPreview;
