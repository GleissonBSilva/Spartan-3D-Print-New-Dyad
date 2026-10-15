import { describe, it, expect } from 'vitest';
import { AiDiagnosticService } from './aiDiagnosticService';

describe('AiDiagnosticService', () => {
  it('responde corretamente e detalhadamente à pergunta de misturar PLA com PTEG', () => {
    const answer = AiDiagnosticService.getExpertAnswer('pode misturar filamento PLA com PTEG?');
    expect(answer).toContain('Misturar Filamento PLA com PETG');
    expect(answer).toContain('NÃO FUNCIONA');
    expect(answer).toContain('Zero-Gap Support');
    expect(answer).toContain('Suporte');
  });

  it('responde com parâmetros exatos sobre stringing em PETG', () => {
    const answer = AiDiagnosticService.getExpertAnswer('como tirar stringing e fiapos de PETG no orcaslicer');
    expect(answer).toContain('Stringing');
    expect(answer).toContain('Retração');
    expect(answer).toContain('Wipe');
  });

  it('responde com parâmetros para evitar warping em ABS', () => {
    const answer = AiDiagnosticService.getExpertAnswer('minha peca de ABS esta descolando com warping da mesa');
    expect(answer).toContain('Warping');
    expect(answer).toContain('100°C a 110°C');
    expect(answer).toContain('Enclosure');
  });

  it('responde com parâmetros de velocidade e retração para TPU', () => {
    const answer = AiDiagnosticService.getExpertAnswer('quais parametros de velocidade e retracao para TPU flexivel');
    expect(answer).toContain('TPU');
    expect(answer).toContain('20 e 35 mm/s');
    expect(answer).toContain('desmoldante');
  });

  it('responde com fórmula de precificação para orçamentos', () => {
    const answer = AiDiagnosticService.getExpertAnswer('como precificar peca 3d e fazer orcamento');
    expect(answer).toContain('Precificação');
    expect(answer).toContain('Matéria-prima');
    expect(answer).toContain('Depreciação');
  });

  it('responde com procedimento de cold pull para desentupir bico', () => {
    const answer = AiDiagnosticService.getExpertAnswer('meu bico 0.4 esta entupido dando estalos');
    expect(answer).toContain('Cold Pull');
    expect(answer).toContain('Heat Creep');
  });
});
