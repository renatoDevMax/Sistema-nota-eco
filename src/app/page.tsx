"use client";

import { useState } from "react";
import UploadCard from "./components/UploadCard";
import FolderList from "./components/FolderList";
import EmailPanel from "./components/EmailPanel";
import StatusPanel from "./components/StatusPanel";
import { FiHome } from "react-icons/fi";

interface ClientData {
  email: string;
  checked: boolean;
}

export default function Home() {
  const [folders, setFolders] = useState<{ name: string; files: File[] }[]>([]);
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState(
    "Prezado(a) cliente,\n\nSegue em anexo as notas fiscais.\n\nAtenciosamente,\nEco Clean"
  );
  const [processedFolders, setProcessedFolders] = useState(0);
  const [showMainContent, setShowMainContent] = useState(false);
  const [clientData, setClientData] = useState<Record<string, ClientData>>({});

  const handleDrop = (newFolders: { name: string; files: File[] }[]) => {
    setFolders(newFolders);
    setProcessedFolders(0);
    setShowMainContent(true);
  };

  const handleProcessedFoldersChange = (count: number) => {
    setProcessedFolders(count);
  };

  const handleClientDataChange = (folderName: string, data: ClientData) => {
    setClientData((prev) => ({
      ...prev,
      [folderName]: data,
    }));
  };

  const handleReset = () => {
    setShowMainContent(false);
    setFolders([]);
    setProcessedFolders(0);
    setClientData({});
  };

  return (
    <main className="h-screen bg-gray-50 p-8 flex flex-col overflow-hidden">
      <div className="max-w-7xl mx-auto w-full flex-1">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center tracking-tight">
          <span className="text-blue-600">Sistema</span>{" "}
          <span className="text-gray-700">EcoClean</span>{" "}
          <span className="text-green-600">NF</span>
        </h1>

        {!showMainContent ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-md">
              <UploadCard onDrop={handleDrop} />
            </div>
          </div>
        ) : (
          <div className="h-[calc(100vh-12rem)] flex items-start justify-around pt-4">
            <div className="w-[400px]">
              <FolderList
                folders={folders}
                processedFolders={processedFolders}
                onClientDataChange={handleClientDataChange}
              />
            </div>

            <div className="w-[400px]">
              <EmailPanel
                folders={folders}
                email={email}
                onEmailChange={setEmail}
                subject={subject}
                onSubjectChange={setSubject}
                message={message}
                onMessageChange={setMessage}
              />
            </div>

            <div className="w-[400px]">
              <StatusPanel
                folders={folders}
                onComplete={() => {
                  // Não fazemos mais nada aqui, apenas deixamos as estatísticas visíveis
                }}
                onReset={handleReset}
                email={email}
                onProcessedFoldersChange={handleProcessedFoldersChange}
                clientData={clientData}
                message={message}
                subject={subject}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-gray-500">
        <FiHome className="w-5 h-5" />
        <span className="text-sm font-medium">R J Company</span>
      </div>
    </main>
  );
}
