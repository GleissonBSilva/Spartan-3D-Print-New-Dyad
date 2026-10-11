"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@/types/saas';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Camera, ImagePlus, UserRound, Sliders, Check, RotateCcw, Image as ImageIcon } from 'lucide-react';

interface ClientSettingsFormProps {
  user: User | null;
  onUpdateUserProfile: (data: Partial<User>) => Promise<void>;
}

export const ClientSettingsForm: React.FC<ClientSettingsFormProps> = ({ user, onUpdateUserProfile }) => {
  const [clientName, setClientName] = useState(user?.name || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [companyPhone, setCompanyPhone] = useState(user?.companyPhone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Estados do Papel de Parede da Farm
  const [bgImage, setBgImage] = useState<string>('');
  const [bgOpacity, setBgOpacity] = useState<number>(0.15);
  const [bgBlur, setBgBlur] = useState<number>(4);
  const wallpaperRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const savedBg = localStorage.getItem('spartan_farm_wallpaper');
      const savedOpacity = localStorage.getItem('spartan_farm_opacity');
      const savedBlur = localStorage.getItem('spartan_farm_blur');

      if (savedBg) setBgImage(savedBg);
      if (savedOpacity) setBgOpacity(Number(savedOpacity));
      if (savedBlur) setBgBlur(Number(savedBlur));
    } catch (e) {}
  }, []);

  const handleWallpaperUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      toast.error('Use uma imagem JPG, PNG ou WebP de até 5 MB para o papel de parede.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setBgImage(result);
      toast.success('Papel de parede carregado com sucesso!');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveWallpaper = () => {
    try {
      localStorage.setItem('spartan_farm_wallpaper', bgImage);
      localStorage.setItem('spartan_farm_opacity', String(bgOpacity));
      localStorage.setItem('spartan_farm_blur', String(bgBlur));
      
      window.dispatchEvent(new Event('spartan_wallpaper_updated'));
      toast.success('Aparência e papel de parede atualizados!');
    } catch (e) {
      toast.error('Erro ao salvar as configurações visuais.');
    }
  };

  const handleResetWallpaper = () => {
    setBgImage('');
    setBgOpacity(0.15);
    setBgBlur(4);
    localStorage.removeItem('spartan_farm_wallpaper');
    localStorage.removeItem('spartan_farm_opacity');
    localStorage.removeItem('spartan_farm_blur');
    window.dispatchEvent(new Event('spartan_wallpaper_updated'));
    toast.info('Papel de parede removido.');
  };

  const handleImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!user?.id || !supabase) { toast.error('Entre na conta para alterar a imagem.'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024) {
      toast.error('Use uma imagem JPG, PNG ou WebP de até 3 MB.'); return;
    }
    setSaving(true);
    try {
      const path = `${user.id}/identity-${Date.now()}.${file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'}`;
      const { error: uploadError } = await supabase.storage.from('profile-images').upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('profile-images').getPublicUrl(path);
      await onUpdateUserProfile({ avatar: data.publicUrl });
      setAvatar(data.publicUrl);
      toast.success('Imagem de perfil atualizada.');
    } catch (error) {
      toast.error(`Não foi possível enviar a imagem: ${error instanceof Error ? error.message : 'erro inesperado'}`);
    } finally { setSaving(false); }
  };

  const handleSaveSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onUpdateUserProfile({ name: clientName.trim(), companyName: companyName.trim(), companyPhone: companyPhone.trim() });
      toast.success('Dados da conta atualizados.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar as alterações.');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="bg-slate-900 border-slate-800 rounded-2xl p-5 sm:p-6">
        <CardHeader className="p-0 pb-5">
          <CardTitle className="text-lg sm:text-xl text-white font-bold">Perfil e dados da empresa</CardTitle>
          <CardDescription className="text-sm text-slate-300 leading-relaxed">Personalize sua identificação e mantenha os dados do estúdio atualizados.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-1 space-y-6">
          <section className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-slate-700 bg-slate-950/50 p-4">
            <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-indigo-400 bg-slate-800 flex items-center justify-center shrink-0">
              {avatar ? <img src={avatar} alt="Imagem de perfil ou logo do estúdio" className="h-full w-full object-cover" /> : <UserRound className="h-8 w-8 text-slate-400" />}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">Foto de perfil ou logo do estúdio</h3>
              <p className="mt-1 text-sm text-slate-400">JPG, PNG ou WebP · até 3 MB. Essa imagem aparece junto ao seu perfil.</p>
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} className="sr-only" aria-label="Escolher foto ou logo" />
            <Button type="button" variant="outline" disabled={saving} onClick={() => fileRef.current?.click()} className="h-10 border-slate-600 bg-slate-800 text-sm text-white hover:bg-slate-700">
              {avatar ? <Camera className="mr-2 h-4 w-4" /> : <ImagePlus className="mr-2 h-4 w-4" />}{avatar ? 'Trocar imagem' : 'Adicionar imagem'}
            </Button>
          </section>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label htmlFor="profile-name" className="text-sm text-slate-200 block mb-1.5 font-medium">Nome do responsável</label>
              <Input id="profile-name" required maxLength={120} value={clientName} onChange={e => setClientName(e.target.value)} className="bg-slate-950 border-slate-700 text-white text-sm rounded-xl h-11" />
            </div>
            <div>
              <label htmlFor="company-name" className="text-sm text-slate-200 block mb-1.5 font-medium">Nome da empresa ou estúdio</label>
              <Input id="company-name" required maxLength={120} value={companyName} onChange={e => setCompanyName(e.target.value)} className="bg-slate-950 border-slate-700 text-white text-sm rounded-xl h-11" />
            </div>
            <div>
              <label htmlFor="company-phone" className="text-sm text-slate-200 block mb-1.5 font-medium">Telefone / WhatsApp comercial</label>
              <Input id="company-phone" type="tel" autoComplete="tel" maxLength={30} placeholder="Ex.: +55 11 99999-9999" value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} className="bg-slate-950 border-slate-700 text-white text-sm rounded-xl h-11" />
              <p className="mt-1.5 text-xs text-slate-400">Esse contato será exibido nas propostas comerciais.</p>
            </div>
            <div>
              <label htmlFor="account-email" className="text-sm text-slate-200 block mb-1.5 font-medium">E-mail da conta</label>
              <Input id="account-email" disabled value={user?.email || ''} className="bg-slate-950/50 border-slate-800 text-slate-400 text-sm rounded-xl h-11 disabled:opacity-100" />
              <p className="mt-1.5 text-xs text-slate-400">Para alterar o e-mail, use as opções de segurança da conta.</p>
            </div>
            <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl h-11 px-6">{saving ? 'Salvando…' : 'Salvar alterações'}</Button>
          </form>
        </CardContent>
      </Card>

      {/* SEÇÃO DE PAPEL DE PAREDE E APARÊNCIA DA FARM */}
      <Card className="bg-slate-900 border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-lg sm:text-xl text-white font-bold flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-indigo-400" /> Papel de Parede da Farm
          </CardTitle>
          <CardDescription className="text-sm text-slate-300">
            Personalize o plano de fundo do seu painel com uma imagem temática sem interferir na legibilidade.
          </CardDescription>
        </CardHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Enviar Imagem (JPG, PNG ou WebP)
              </label>
              <input ref={wallpaperRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleWallpaperUpload} className="sr-only" />
              <Button type="button" variant="outline" onClick={() => wallpaperRef.current?.click()} className="w-full border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800 text-xs h-10">
                <ImagePlus className="w-4 h-4 mr-2" /> Escolher Wallpaper
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Opacidade do Fundo ({Math.round(bgOpacity * 100)}%)</span>
              </div>
              <input 
                type="range" 
                min="0.05" 
                max="0.6" 
                step="0.02" 
                value={bgOpacity}
                onChange={(e) => setBgOpacity(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Desfoque / Blur ({bgBlur}px)</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="20" 
                step="1" 
                value={bgBlur}
                onChange={(e) => setBgBlur(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Preview visual */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950 p-4 relative overflow-hidden min-h-[180px]">
            <span className="absolute top-2.5 left-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Preview</span>
            
            {bgImage ? (
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-300 pointer-events-none"
                style={{ 
                  backgroundImage: `url(${bgImage})`, 
                  opacity: bgOpacity,
                  filter: `blur(${bgBlur}px)`
                }}
              />
            ) : (
              <div className="text-center text-xs text-slate-600">Nenhum wallpaper definido</div>
            )}

            <div className="relative z-10 bg-slate-900/90 border border-slate-700 rounded-lg p-3 shadow-lg max-w-[200px] w-full text-center space-y-1">
              <div className="h-1.5 w-12 bg-indigo-500 rounded mx-auto mb-1"></div>
              <p className="text-[11px] font-bold text-white">Exemplo de Card</p>
              <p className="text-[9px] text-slate-400">Texto legível sobre o fundo.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={handleResetWallpaper} className="border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800 text-xs">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Remover Fundo
          </Button>
          <Button type="button" onClick={handleSaveWallpaper} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold">
            <Check className="w-3.5 h-3.5 mr-1.5" /> Salvar Aparência
          </Button>
        </div>
      </Card>
    </div>
  );
};