"use client";

import { motion } from "framer-motion";
import { FiMail, FiFileText } from "react-icons/fi";

interface EmailPanelProps {
  folders: { name: string; files: File[] }[];
  email: string;
  onEmailChange: (email: string) => void;
  subject: string;
  onSubjectChange: (subject: string) => void;
  message: string;
  onMessageChange: (message: string) => void;
}

const EmailPanel = ({
  folders,
  email,
  onEmailChange,
  subject,
  onSubjectChange,
  message,
  onMessageChange,
}: EmailPanelProps) => {
  const defaultMessage = `Prezado(a) {cliente.nome},

Informamos que as notas fiscais {numeros_notas} estão disponíveis para pagamento.

Para efetuar o pagamento, acesse os boletos anexos.

Atenciosamente,
EcoClean`;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col"
    >
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-700">
          Configuração de Email
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email de Destino
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="exemplo@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assunto
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFileText className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Notas Fiscais - {cliente.nome}"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mensagem
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
              <FiFileText className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[200px] resize-none"
            />
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p>Variáveis disponíveis:</p>
          <ul className="list-disc list-inside mt-1">
            <li>{`{cliente.nome}`} - Nome do cliente</li>
            <li>{`{numeros_notas}`} - Números das notas fiscais</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default EmailPanel;
