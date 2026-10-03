"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@/types/saas';
import { toast } from 'sonner';

interface ClientSettingsFormProps {
  user: User | null;
  onUpdateUserProfile: (data: Partial<User>) => void;
}

export const ClientSettingsForm: React.FC<ClientSettingsFormProps> = ({
  user,
  onUpdateUserProfile,
}) => {
  const [clientName, setClientName] = useState(user?.name || 'Carlos Mendes');
  const [companyName, setCompanyName] = useState(user?.companyName || 'Mendes Growth Digital');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUserProfile({ name: clientName, companyName });
    toast.success('Configurações da empresa atualizadas com sucesso!');
  };

  return (
    <Card className="bg-slate-900 border-slate-800 rounded-2xl p-6 max-w-2xl">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-base text-white font-bold">Informações da Conta & Empresa</CardTitle>
        <CardDescription className="text-xs text-slate-400">
          Altere os dados cadastrais para emissão de recibos e identificação
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 pt-2">
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <label className="text-xs text-slate-300 block mb-1 font-medium">Nome do Responsável</label>
            <Input
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              className="bg-slate-950 border-slate-750 text-white text-xs rounded-xl h-10"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1 font-medium">Nome da Empresa</label>
            <Input
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              className="bg-slate-950 border-slate-750 text-white text-xs rounded-xl h-10"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1 font-medium">E-mail Corporativo</label>
            <Input
              disabled
              value={user?.email || 'carlos@agencia.com'}
              className="bg-slate-950/50 border-slate-800 text-slate-500 text-xs rounded-xl h-10"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl h-10 px-6">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};