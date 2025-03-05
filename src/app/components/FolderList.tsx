"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FiFolder,
  FiFile,
  FiChevronRight,
  FiChevronDown,
  FiCheckCircle,
  FiMail,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import PDFPreview from "./PDFPreview";

interface FolderContent {
  name: string;
  files: File[];
}

interface ClientData {
  email: string;
  checked: boolean;
}

interface FolderListProps {
  folders: FolderContent[];
  processedFolders: number;
  onClientDataChange: (folderName: string, data: ClientData) => void;
}

const scrollStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
    transition: background-color 0.3s ease;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.2);
  }

  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
  }
`;

const FolderList = ({
  folders,
  processedFolders,
  onClientDataChange,
}: FolderListProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [clientData, setClientData] = useState<Record<string, ClientData>>({});
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = scrollStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderName)) {
        newSet.delete(folderName);
      } else {
        newSet.add(folderName);
      }
      return newSet;
    });
  };

  const handleEmailChange = (folderName: string, email: string) => {
    const newData = {
      ...clientData[folderName],
      email,
    };
    setClientData((prev) => ({
      ...prev,
      [folderName]: newData,
    }));
    onClientDataChange(folderName, newData);
  };

  const handleCheckboxChange = (folderName: string, checked: boolean) => {
    const newData = {
      ...clientData[folderName],
      checked,
    };
    setClientData((prev) => ({
      ...prev,
      [folderName]: newData,
    }));
    onClientDataChange(folderName, newData);
  };

  return (
    <div className="relative h-full">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="h-full max-h-[500px] bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col"
      >
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700">Pastas</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {folders.map((folder, index) => (
            <div key={folder.name} className="relative">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => toggleFolder(folder.name)}
                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 cursor-pointer ${
                  index < processedFolders
                    ? "bg-green-50 border border-green-200"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiFolder
                    className={`w-5 h-5 ${
                      index < processedFolders
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      index < processedFolders
                        ? "text-green-700"
                        : "text-gray-600"
                    }`}
                  >
                    {folder.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {index < processedFolders && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="text-green-500"
                    >
                      <FiCheckCircle className="w-5 h-5" />
                    </motion.div>
                  )}
                  <FiChevronRight
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      expandedFolders.has(folder.name) ? "rotate-90" : ""
                    }`}
                  />
                </div>
              </motion.div>

              <AnimatePresence>
                {expandedFolders.has(folder.name) && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-8 space-y-1 mt-2"
                    >
                      {folder.files.map((file, fileIndex) => (
                        <motion.div
                          key={file.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: fileIndex * 0.05 }}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setPreviewFile(file)}
                        >
                          <FiFile className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 text-sm truncate group relative">
                            {file.name}
                            <span className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap z-50">
                              {file.name}
                              <span className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></span>
                            </span>
                          </span>
                        </motion.div>
                      ))}

                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email do Cliente
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiMail className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                type="email"
                                value={clientData[folder.name]?.email || ""}
                                onChange={(e) =>
                                  handleEmailChange(folder.name, e.target.value)
                                }
                                className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="cliente@email.com"
                              />
                            </div>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={
                                clientData[folder.name]?.checked || false
                              }
                              onChange={(e) =>
                                handleCheckboxChange(
                                  folder.name,
                                  e.target.checked
                                )
                              }
                              className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label className="ml-2 text-sm text-gray-700">
                              Confirmar envio
                            </label>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>

      <PDFPreview file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
};

export default FolderList;
