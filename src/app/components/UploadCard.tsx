"use client";

import { motion } from "framer-motion";
import { FiUpload, FiFolder } from "react-icons/fi";
import { useCallback } from "react";

declare global {
  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
  }
  interface FileSystemDirectoryHandle {
    values(): AsyncIterableIterator<{
      kind: "file" | "directory";
      name: string;
      getFile(): Promise<File>;
      values(): AsyncIterableIterator<{
        kind: "file" | "directory";
        name: string;
        getFile(): Promise<File>;
      }>;
    }>;
  }
}

interface UploadCardProps {
  onDrop: (folders: { name: string; files: File[] }[]) => void;
}

const UploadCard = ({ onDrop }: UploadCardProps) => {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const items = e.dataTransfer.items;
      const folders: { name: string; files: File[] }[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file") {
          const entry = item.webkitGetAsEntry();
          if (entry?.isDirectory) {
            const folder = await readDirectory(
              entry as FileSystemDirectoryEntry
            );
            folders.push(folder);
          }
        }
      }

      if (folders.length > 0) {
        onDrop(folders);
      }
    },
    [onDrop]
  );

  const handleClick = useCallback(async () => {
    try {
      const dirHandle = await window.showDirectoryPicker();
      const folders: { name: string; files: File[] }[] = [];

      for await (const entry of (dirHandle as any).values()) {
        if (entry.kind === "directory") {
          const files: File[] = [];
          for await (const file of (entry as any).values()) {
            if (file.kind === "file") {
              const fileHandle = await file.getFile();
              files.push(fileHandle);
            }
          }
          folders.push({
            name: entry.name,
            files,
          });
        }
      }

      if (folders.length > 0) {
        onDrop(folders);
      }
    } catch (err) {
      console.error("Erro ao selecionar pasta:", err);
    }
  }, [onDrop]);

  const readDirectory = async (
    dirEntry: FileSystemDirectoryEntry
  ): Promise<{ name: string; files: File[] }> => {
    return new Promise((resolve, reject) => {
      const files: File[] = [];
      const reader = dirEntry.createReader();

      reader.readEntries((entries) => {
        const promises = entries.map((entry) => {
          if (entry.isFile) {
            return new Promise<void>((resolve) => {
              (entry as FileSystemFileEntry).file((file) => {
                files.push(file);
                resolve();
              });
            });
          }
          return Promise.resolve();
        });

        Promise.all(promises).then(() => {
          resolve({
            name: dirEntry.name,
            files,
          });
        });
      }, reject);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300 p-8 cursor-pointer hover:border-blue-500 transition-colors"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <FiUpload className="w-8 h-8 text-blue-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Arraste e solte uma pasta aqui
        </h2>
        <p className="text-gray-500 mb-4">
          ou clique para selecionar uma pasta
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <FiFolder className="w-4 h-4" />
          <span>Pasta com notas fiscais</span>
        </div>
      </div>
    </motion.div>
  );
};

export default UploadCard;
