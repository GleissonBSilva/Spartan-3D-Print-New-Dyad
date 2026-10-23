/**
 * Utilitário para geração de Payload Pix (EMV BR Code Padrão Banco Central)
 * Permite gerar códigos Pix "Copia e Cola" e QR Codes válidos para qualquer banco brasileiro.
 * Persiste a chave Pix de forma definitiva no Supabase (spartan_user_settings) e em cache local.
 */

import { supabase } from '@/lib/supabase';

export interface PixConfig {
  chave: string;
  tipoChave: 'cnpj' | 'cpf' | 'email' | 'telefone' | 'aleatoria';
  nomeTitular: string;
  cidade: string;
}

export interface PixChargeParams {
  chave: string;
  nomeTitular: string;
  cidade: string;
  valor: number;
  txId?: string;
  descricao?: string;
}

const DEFAULT_CONFIG_KEY_PREFIX = 'spartan_pix_config_';
const pixConfigMemoryCache = new Map<string, PixConfig>();

export const DEFAULT_PIX_CONFIG: PixConfig = {
  chave: '',
  tipoChave: 'telefone',
  nomeTitular: '',
  cidade: 'MANAUS',
};

export function getSavedPixConfig(userId?: string | null): PixConfig {
  if (!userId) return { ...DEFAULT_PIX_CONFIG };
  if (pixConfigMemoryCache.has(userId)) {
    return { ...DEFAULT_PIX_CONFIG, ...pixConfigMemoryCache.get(userId)! };
  }
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(`${DEFAULT_CONFIG_KEY_PREFIX}${userId}`);
      if (saved) {
        const parsed = { ...DEFAULT_PIX_CONFIG, ...JSON.parse(saved) };
        pixConfigMemoryCache.set(userId, parsed);
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Não foi possível recuperar configuração Pix salva:', error);
  }
  return { ...DEFAULT_PIX_CONFIG };
}

/**
 * Sincroniza a configuração Pix salva na nuvem (Supabase) para o usuário
 */
export async function syncPixConfigFromSupabase(userId: string): Promise<PixConfig> {
  if (!userId) return getSavedPixConfig(userId);
  try {
    if (!supabase) return getSavedPixConfig(userId);
    const { data: sessionData } = await supabase.auth.getSession();
    const sessionUserId = sessionData?.session?.user?.id;
    if (sessionUserId && sessionUserId !== userId) {
      return getSavedPixConfig(userId);
    }

    const { data, error } = await supabase
      .from('spartan_user_settings')
      .select('payment_settings')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data?.payment_settings) {
      const ps = data.payment_settings as Record<string, unknown>;
      const adminPix = ps.admin_pix as Partial<PixConfig> | undefined;
      const chave = String(adminPix?.chave || ps.pixKey || '').trim();
      const nomeTitular = String(adminPix?.nomeTitular || ps.pixBeneficiary || '').trim();
      const tipoChave = (adminPix?.tipoChave || ps.pixKeyType || 'telefone') as PixConfig['tipoChave'];
      const cidade = String(adminPix?.cidade || ps.pixCity || 'MANAUS').trim();

      if (chave) {
        const merged: PixConfig = {
          chave,
          tipoChave,
          nomeTitular,
          cidade,
        };
        pixConfigMemoryCache.set(userId, merged);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(`${DEFAULT_CONFIG_KEY_PREFIX}${userId}`, JSON.stringify(merged));
        }
        return merged;
      }
    }
  } catch (err) {
    console.warn('Erro ao sincronizar Pix do Supabase:', err);
  }
  return getSavedPixConfig(userId);
}

/**
 * Salva a configuração Pix tanto no localStorage quanto no banco de dados Supabase de forma permanente
 */
export async function savePixConfig(config: PixConfig, userId?: string | null): Promise<void> {
  try {
    if (!userId) return;
    pixConfigMemoryCache.set(userId, { ...config });

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`${DEFAULT_CONFIG_KEY_PREFIX}${userId}`, JSON.stringify(config));
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('spartan_pix_config_updated', { detail: { config, userId } })
      );
    }

    if (supabase) {
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUserId = sessionData?.session?.user?.id;
      if (!sessionUserId || sessionUserId !== userId) return;

      const { data: existing } = await supabase
        .from('spartan_user_settings')
        .select('payment_settings')
        .eq('user_id', userId)
        .maybeSingle();

      const existingPayment = (existing?.payment_settings as Record<string, unknown>) || {};
      const updatedPayment = {
        ...existingPayment,
        admin_pix: config,
        pixKey: config.chave,
        pixBeneficiary: config.nomeTitular,
        pixKeyType: config.tipoChave,
        pixCity: config.cidade,
      };

      await supabase
        .from('spartan_user_settings')
        .upsert(
          {
            user_id: userId,
            payment_settings: updatedPayment,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
    }
  } catch (error) {
    console.warn('Não foi possível salvar configuração Pix:', error);
  }
}

/**
 * Normaliza strings para o padrão EMV (sem acentos, caracteres especiais ou cedilhas)
 */
function normalizePixText(text: string, maxLength: number): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .trim()
    .toUpperCase()
    .slice(0, maxLength);
}

/**
 * Calcula o Checksum CRC16 (CCITT-FALSE 0x1021) exigido pelo padrão EMV
 */
export function calculateCRC16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatEmvField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

/**
 * Gera a string Pix Copia e Cola conforme especificação do Banco Central do Brasil
 */
export function generatePixPayload(params: PixChargeParams): string {
  const chave = params.chave.trim();
  const nome = normalizePixText(params.nomeTitular || 'SPARTAN 3D', 25) || 'SPARTAN 3D';
  const cidade = normalizePixText(params.cidade || 'MANAUS', 15) || 'MANAUS';
  const txId = (params.txId || '***').replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || '***';
  const valorFormatado = params.valor > 0 ? params.valor.toFixed(2) : '';

  // 26: Merchant Account Information
  const gui = formatEmvField('00', 'br.gov.bcb.pix');
  const chaveField = formatEmvField('01', chave);
  const descField = params.descricao ? formatEmvField('02', normalizePixText(params.descricao, 40)) : '';
  const merchantAccountInfo = formatEmvField('26', `${gui}${chaveField}${descField}`);

  // 62: Additional Data Field (TxID)
  const additionalData = formatEmvField('62', formatEmvField('05', txId));

  // Montagem preliminar do payload
  const payload =
    formatEmvField('00', '01') + // Payload Format Indicator
    merchantAccountInfo +
    formatEmvField('52', '0000') + // Merchant Category Code
    formatEmvField('53', '986') + // Currency: BRL
    (valorFormatado ? formatEmvField('54', valorFormatado) : '') +
    formatEmvField('58', 'BR') + // Country Code
    formatEmvField('59', nome) +
    formatEmvField('60', cidade) +
    additionalData +
    '6304'; // CRC16 Header

  // Adiciona o CRC16 calculado no final
  const crc = calculateCRC16(payload);
  return `${payload}${crc}`;
}

/**
 * Gera URL de imagem do QR Code para o payload Pix
 */
export function getPixQrCodeUrl(pixPayload: string, size = 260): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(
    pixPayload
  )}`;
}
