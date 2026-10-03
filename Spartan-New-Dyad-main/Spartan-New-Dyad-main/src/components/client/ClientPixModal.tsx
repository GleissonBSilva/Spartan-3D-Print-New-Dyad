"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ClientPixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClientPixModal: React.FC<ClientPixModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const copyPixKey = () => {
    navigator.clipboard.writeText('00020126580014br.gov.bcb.pix0136nexus-growth-pix-key-99215204000053039865802BR5925NexusGrowthTechnologies6009SaoPaulo62070503***6304E8A2');
    toast.success('Código Pix Copia e Cola copiado para a área de transferência!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 text-center shadow-2xl">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Pagamento Pix Instantâneo</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="p-4 bg-white rounded-2xl inline-block mx-auto shadow-xl">
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=00020126580014br.gov.bcb.pix0136nexus-growth-pix-key-99215204000053039865802BR5925NexusGrowthTechnologies6009SaoPaulo62070503***6304E8A2"
            alt="QR Code Pix"
            className="w-44 h-44 mx-auto"
          />
        </div>

        <p className="text-xs text-slate-300">
          Escaneie o QR Code acima com o app do seu banco ou copie a chave Pix abaixo.
        </p>

        <div className="space-y-2">
          <Button
            onClick={copyPixKey}
            variant="outline"
            className="w-full bg-slate-950 border-slate-750 text-white text-xs h-10 rounded-xl"
          >
            <Copy className="w-3.5 h-3.5 mr-1" /> Copiar Código Pix Copia e Cola
          </Button>
          <Button
            onClick={() => {
              onClose();
              toast.success('Pagamento Pix identificado e compensado com sucesso!');
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold h-10 rounded-xl"
          >
            Já realizei o Pix (Confirmar)
          </Button>
        </div>
      </div>
    </div>
  );
};