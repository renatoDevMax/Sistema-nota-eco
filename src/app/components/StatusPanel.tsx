"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FiClock,
  FiMail,
  FiFolder,
  FiCheck,
  FiPlay,
  FiPause,
  FiAlertCircle,
  FiCheckCircle,
  FiBarChart2,
  FiCalendar,
  FiUsers,
  FiSend,
} from "react-icons/fi";
import { useEffect, useState } from "react";
import { sendEmail } from "../services/emailService";

interface Folder {
  name: string;
  files: File[];
}

interface ClientData {
  email: string;
  checked: boolean;
}

interface StatusPanelProps {
  folders: Folder[];
  onComplete: () => void;
  onReset: () => void;
  email: string;
  onProcessedFoldersChange: (count: number) => void;
  clientData: Record<string, ClientData>;
  message: string;
  subject: string;
}

interface Statistics {
  endTime: Date;
  totalTime: number;
  totalEmails: number;
  startTime: Date;
  successRate: number;
}

const StatusPanel = ({
  folders,
  onComplete,
  onReset,
  email,
  onProcessedFoldersChange,
  clientData,
  message,
  subject,
}: StatusPanelProps) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [processedFolders, setProcessedFolders] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [errors, setErrors] = useState<
    { folder: string; error: string | null }[]
  >([]);
  const [currentFolder, setCurrentFolder] = useState<string>("");

  const totalMessages = folders.length;
  const totalFiles = folders.reduce(
    (acc, folder) => acc + folder.files.length,
    0
  );

  // Calcular tempo estimado baseado no número de pastas
  const estimatedTimePerEmail = 3; // segundos por email
  const estimatedTotalTime = totalMessages * estimatedTimePerEmail;

  const handlePlay = () => {
    if (!email || !email.includes("@") || email.endsWith("@")) {
      setError(
        "Por favor, informe um email válido antes de iniciar o processo."
      );
      return;
    }

    setIsPlaying(true);
    setCurrentIndex(0);
    setProcessedFolders(0);
    setError(null);
    setIsCompleted(false);
    setStatistics(null);
    setStartTime(new Date());
    setErrors([]);
  };

  useEffect(() => {
    if (
      !isPlaying ||
      folders.length === 0 ||
      !email ||
      !email.includes("@") ||
      email.endsWith("@")
    )
      return;

    const startTime = new Date();
    setStartTime(startTime);
    setStatistics({
      startTime,
      endTime: new Date(),
      totalTime: 0,
      totalEmails: folders.length,
      successRate: 0,
    });

    const processNextFolder = async () => {
      if (currentIndex >= folders.length) {
        const endTime = new Date();
        const totalTimeInSeconds = Math.floor(
          (endTime.getTime() - startTime.getTime()) / 1000
        );
        const successRate =
          ((processedFolders - errors.length) / folders.length) * 100;

        setStatistics((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            endTime,
            totalTime: totalTimeInSeconds,
            successRate: successRate,
          };
        });
        setIsCompleted(true);
        onComplete();
        return;
      }

      const folder = folders[currentIndex];
      setCurrentFolder(folder.name);
      setIsProcessing(true);

      try {
        const invoiceNumbers = folder.files
          .map((file) => file.name.match(/\d+/)?.[0])
          .filter(Boolean)
          .join(", ");

        const personalizedMessage = message
          .replace(/{cliente\.nome}/g, folder.name)
          .replace(/{numeros_notas}/g, invoiceNumbers);

        const attachments = await Promise.all(
          folder.files.map(async (file) => {
            const buffer = await file.arrayBuffer();
            return {
              filename: file.name,
              content: Buffer.from(buffer).toString("base64"),
              encoding: "base64",
            };
          })
        );

        const folderClientData = clientData[folder.name];
        const targetEmail =
          (folderClientData?.checked && folderClientData?.email) || email;

        const personalizedSubject = subject
          .replace(/{cliente\.nome}/g, folder.name)
          .replace(/{numeros_notas}/g, invoiceNumbers);

        await sendEmail({
          to: targetEmail,
          subject: personalizedSubject || `Notas Fiscais - ${folder.name}`,
          text: personalizedMessage,
          html: personalizedMessage.replace(/\n/g, "<br>"),
          attachments,
        });

        setProcessedFolders((prev) => prev + 1);
        onProcessedFoldersChange(processedFolders + 1);
        setCurrentIndex((prev) => prev + 1);
      } catch (error) {
        console.error(
          `Erro ao enviar email para ${email} - pasta ${folder.name}:`,
          error
        );
        setErrors((prev) => [
          ...prev,
          {
            folder: folder.name,
            error: error instanceof Error ? error.message : "Erro desconhecido",
          },
        ]);
        setCurrentIndex((prev) => prev + 1);
      }
      setIsProcessing(false);
    };

    processNextFolder();
  }, [
    currentIndex,
    folders,
    onComplete,
    errors.length,
    email,
    processedFolders,
    onProcessedFoldersChange,
    isPlaying,
    clientData,
    message,
    subject,
  ]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !isCompleted) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDateTime = (date: Date | undefined) => {
    if (!date) return "N/A";
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const handlePause = () => {
    setIsPlaying(false);
    setTimeLeft(30);
    setCurrentIndex(0);
    setProcessedFolders(0);
    setError(null);
    setIsCompleted(false);
    setStatistics(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col"
    >
      <AnimatePresence mode="wait">
        {!isPlaying && !isCompleted ? (
          <motion.div
            key="play-button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex items-center justify-center p-8"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePlay}
              className="flex items-center gap-3 bg-blue-500 text-white px-8 py-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
            >
              <FiPlay className="w-6 h-6" />
              <span className="text-lg font-medium">Iniciar Processamento</span>
            </motion.button>
          </motion.div>
        ) : isCompleted ? (
          <motion.div
            key="completed-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col p-8"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-green-500 mb-4"
              >
                <FiCheckCircle className="w-16 h-16 mx-auto" />
              </motion.div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                Processo Concluído
              </h3>
              <p className="text-gray-600">
                Todos os emails foram processados com sucesso
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <FiClock className="w-5 h-5" />
                  <span className="text-sm font-medium">Tempo Total</span>
                </div>
                <p className="text-2xl font-semibold text-gray-800">
                  {formatTime(statistics?.totalTime || 0)}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <FiMail className="w-5 h-5" />
                  <span className="text-sm font-medium">Emails Enviados</span>
                </div>
                <p className="text-2xl font-semibold text-gray-800">
                  {statistics?.totalEmails || 0}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <FiCalendar className="w-5 h-5" />
                  <span className="text-sm font-medium">Início:</span>
                  <span className="text-sm">
                    {formatDateTime(statistics?.startTime)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FiCalendar className="w-5 h-5" />
                  <span className="text-sm font-medium">Fim:</span>
                  <span className="text-sm">
                    {formatDateTime(statistics?.endTime)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FiBarChart2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Taxa de Sucesso:</span>
                  <span className="text-sm">
                    {statistics?.successRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-auto flex justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlay}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Novo Envio
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onReset}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Voltar ao Início
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="status-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col p-8"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePause}
              className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
            >
              <FiPause className="w-5 h-5" />
            </motion.button>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FiFolder className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-600">
                      {processedFolders} de {folders.length} pastas
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMail className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">
                      {processedFolders} de {totalMessages} mensagens
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                  <FiBarChart2 className="w-5 h-5 text-blue-500" />
                  <span className="text-blue-600 font-medium">
                    {Math.round((processedFolders / folders.length) * 100)}%
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <FiCheck className="w-5 h-5 text-green-500" />
                  <span>
                    Processando pasta:{" "}
                    {folders[currentIndex]?.name || "Concluído"}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <FiMail className="w-5 h-5 text-blue-500" />
                  <span>Enviando para: {currentFolder}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <FiClock className="w-5 h-5 text-orange-500" />
                  <span>
                    {isProcessing
                      ? "Enviando email..."
                      : "Aguardando próximo envio..."}
                  </span>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-lg">
                    <FiAlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-auto space-y-4">
              <div className="w-full bg-gray-100 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(processedFolders / folders.length) * 100}%`,
                  }}
                  transition={{ duration: 0.5 }}
                  className="h-2 bg-blue-500 rounded-full"
                />
              </div>
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePause}
                  className="flex items-center gap-2 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <FiPause className="w-5 h-5" />
                  <span>Pausar Processamento</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StatusPanel;
