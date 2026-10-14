/**
 * Utilitário para geração de Payload Pix (EMV BR Code Padrão Banco Central)
 * Permite gerar códigos Pix "Copia e Cola" e QR Codes válidos para qualquer banco brasileiro.
 */

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

const DEFAULT_CONFIG_KEY = 'spartan_pix_config';

export const DEFAULT_PIX_CONFIG: PixConfig = {
  chave: 'financeiro@spartan3d.com.br',
  tipoChave: 'email',
  nomeTitular: 'SPARTAN 3D PRINT',
  cidade: 'SAO PAULO',
};

export function getSavedPixConfig(): PixConfig {
  try {
    const saved = localStorage.getItem(DEFAULT_CONFIG_KEY);
    if (saved) {
      return { ...DEFAULT_PIX_CONFIG, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.warn('Não foi possível recuperar configuração Pix salva:', error);
  }
  return DEFAULT_PIX_CONFIG;
}

export function savePixConfig(config: PixConfig): void {
  try {
    localStorage.setItem(DEFAULT_CONFIG_KEY, JSON.stringify(config));
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
  const cidade = normalizePixText(params.cidade || 'SAO PAULO', 15) || 'SAO PAULO';
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
