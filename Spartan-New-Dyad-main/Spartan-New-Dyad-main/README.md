# Spartan 3D Print - Plataforma SaaS Completa para Impressão 3D

Sistema SaaS avançado para gestão de impressão 3D, cálculo de custos, orçamentos e gerenciamento de farms de impressão. Agora com backend completo, integrações reais e otimizações de performance.

## 🚀 Melhorias Implementadas

### 1. Backend Completo com PostgreSQL + Prisma ORM
- ✅ Estrutura de backend Node.js/Express configurada
- ✅ Schema Prisma completo com todos os modelos do sistema
- ✅ Suporte a PostgreSQL com tipos otimizados
- ✅ Migrações de banco de dados automatizadas

### 2. API REST Completa
- ✅ Rotas completas para: usuários, projetos, impressoras, filamentos, planos, faturas
- ✅ Autenticação JWT com middleware de segurança
- ✅ Validação de dados e tratamento de erros
- ✅ Documentação de endpoints preparada

### 3. Autenticação Real com JWT
- ✅ Sistema de registro e login funcional
- ✅ Tokens JWT com expiração configurável
- ✅ Middleware de autenticação e autorização
- ✅ Gerenciamento de sessões seguro

### 4. Integração de Pagamento Real
- ✅ Stripe integration para cartões de crédito
- ✅ Mercado Pago integration para PIX
- ✅ Webhooks para notificações de pagamento
- ✅ Sistema de faturas automatizado

### 5. Inteligência Artificial Real (OpenAI)
- ✅ Integration com OpenAI GPT-4
- ✅ Chatbot especialista em impressão 3D
- ✅ Diagnóstico de problemas de impressão
- ✅ Otimização de parâmetros de impressão
- ✅ Sistema de créditos de IA

### 6. Upload Real de Arquivos
- ✅ Upload de arquivos STL, 3MF, G-code, OBJ, STEP, IGES
- ✅ Validação de tipos de arquivo
- ✅ Limite de tamanho configurável
- ✅ Armazenamento seguro com Multer

### 7. Visualização 3D de Modelos
- ✅ Componente Three.js para visualização de modelos 3D
- ✅ Integração com React Three Fiber
- ✅ Controles de câmera interativos
- ✅ Suporte a múltiplos formatos de arquivo

### 8. Melhorias de Acessibilidade (WCAG)
- ✅ Skip links para navegação por teclado
- ✅ Atributos ARIA apropriados
- ✅ Suporte a prefers-reduced-motion
- ✅ Alto contraste e foco visível
- ✅ Navegação semântica completa

### 9. Testes Automatizados
- ✅ Configuração Jest + React Testing Library
- ✅ Testes unitários para componentes principais
- ✅ Testes de serviços e utilitários
- ✅ Cobertura de código configurada (70%)
- ✅ Scripts de test no package.json

### 10. CI/CD com GitHub Actions
- ✅ Pipeline completo de CI/CD
- ✅ Testes automatizados em cada commit
- ✅ Build de frontend e backend
- ✅ Deploy automático para Vercel (frontend)
- ✅ Integração com PostgreSQL nos testes

### 11. Lazy Loading e Performance
- ✅ Lazy loading de todas as páginas
- ✅ Code splitting otimizado no Vite
- ✅ Configuração do React Query com cache
- ✅ Componentes de loading
- ✅ Otimização de bundle size

### 12. Integração Capacitor Mobile
- ✅ Configuração Capacitor otimizada
- ✅ Suporte a notificações push nativas
- ✅ Configuração de splash screen
- ✅ Build para Android e iOS
- ✅ Configuração de assinatura de apps

### 13. Sistema de Notificações
- ✅ Notificações push nativas (Capacitor)
- ✅ Notificações locais
- ✅ Suporte a notificações web (browser)
- ✅ Serviço completo de gerenciamento
- ✅ Registro de tokens de push

### 14. Dashboard Analítico Avançado
- ✅ Dashboard com Recharts completo
- ✅ KPIs em tempo real (receita, usuários, impressões, lucro)
- ✅ Gráficos de receita, crescimento, performance
- ✅ Análise de uso de materiais
- ✅ Breakdown de despesas
- ✅ Exportação de relatórios

### 15. Sistema de Cache com Redis
- ✅ Integração Redis completa
- ✅ Middleware de cache automático
- ✅ Invalidação de cache inteligente
- ✅ Estatísticas de cache
- ✅ Cache warming e múltiplas operações

## 📁 Estrutura do Projeto

```
spartan-3d-print/
├── backend/                 # Backend Node.js/Express
│   ├── src/
│   │   ├── controllers/    # Controladores da API
│   │   ├── middleware/    # Middleware (auth, cache, etc)
│   │   ├── routes/        # Rotas da API
│   │   ├── services/      # Serviços (IA, cache, etc)
│   │   └── index.ts       # Entry point do backend
│   ├── prisma/
│   │   └── schema.prisma  # Schema do banco de dados
│   └── package.json
├── src/                    # Frontend React
│   ├── components/
│   │   ├── admin/        # Componentes admin
│   │   ├── client/       # Componentes cliente
│   │   ├── landing/      # Componentes landing page
│   │   ├── layout/       # Layout components
│   │   └── ui/           # Shadcn UI components
│   ├── pages/            # Páginas da aplicação
│   ├── services/         # Serviços frontend
│   ├── context/          # React Context
│   └── __tests__/        # Testes
├── .github/
│   └── workflows/
│       └── ci.yml        # Pipeline CI/CD
└── capacitor.config.ts   # Configuração mobile
```

## 🔧 Configuração

### Backend

1. **Variáveis de Ambiente (.env)**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/spartan_3d_print"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3001
OPENAI_API_KEY="your-openai-key"
STRIPE_SECRET_KEY="your-stripe-key"
MERCADO_PAGO_ACCESS_TOKEN="your-mp-token"
REDIS_HOST="localhost"
REDIS_PORT=6379
```

2. **Instalar Dependências**
```bash
cd backend
npm install
```

3. **Configurar Banco de Dados**
```bash
npx prisma generate
npx prisma migrate dev
```

4. **Rodar Backend**
```bash
npm run dev
```

### Frontend

1. **Instalar Dependências**
```bash
npm install --legacy-peer-deps
```

2. **Rodar Frontend**
```bash
npm run dev
```

3. **Build para Produção**
```bash
npm run build
```

### Mobile (Capacitor)

1. **Build Android**
```bash
npm run build
npx cap sync android
npx cap open android
```

2. **Build iOS**
```bash
npm run build
npx cap sync ios
npx cap open ios
```

## 🧪 Testes

```bash
# Rodar todos os testes
npm test

# Rodar testes em modo watch
npm run test:watch

# Gerar coverage
npm run test:coverage
```

## 🚀 Deploy

### Frontend (Vercel)
O pipeline CI/CD faz deploy automático para Vercel quando há push para main.

### Backend
Configure seu serviço de hosting (AWS, DigitalOcean, etc) e aponte para o diretório `backend/dist`.

### Mobile
Use os builds do Capacitor para publicar nas lojas de apps.

## 📊 Novos Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Perfil do usuário

### Projetos
- `GET /api/projects` - Listar projetos
- `POST /api/projects` - Criar projeto
- `GET /api/projects/:id` - Buscar projeto
- `PUT /api/projects/:id` - Atualizar projeto
- `PATCH /api/projects/:id/status` - Atualizar status
- `DELETE /api/projects/:id` - Deletar projeto

### Impressoras
- `GET /api/printers` - Listar impressoras
- `POST /api/printers` - Adicionar impressora
- `PUT /api/printers/:id` - Atualizar impressora
- `PATCH /api/printers/:id/status` - Atualizar status
- `DELETE /api/printers/:id` - Remover impressora

### Filamentos
- `GET /api/filaments` - Listar filamentos
- `POST /api/filaments` - Adicionar filamento
- `PUT /api/filaments/:id` - Atualizar filamento
- `PATCH /api/filaments/:id/consume` - Consumir filamento
- `DELETE /api/filaments/:id` - Remover filamento

### IA
- `POST /api/ai/chat` - Chat com IA
- `POST /api/ai/diagnose` - Diagnóstico de problemas
- `POST /api/ai/optimize` - Otimizar parâmetros
- `GET /api/ai/history` - Histórico de conversas

### Upload
- `POST /api/upload/3d-model` - Upload modelo 3D
- `POST /api/upload/gcode` - Upload G-code

### Cache
- `GET /api/cache/stats` - Estatísticas do cache
- `POST /api/cache/clear` - Limpar cache
- `POST /api/cache/invalidate/user/:userId` - Invalidar cache usuário

## 🎯 Próximos Passos Sugeridos

1. **Deploy de Produção**
   - Configurar banco de dados PostgreSQL production
   - Configurar Redis production
   - Deploy backend em serviço cloud (AWS/DigitalOcean)
   - Configurar domínios e SSL

2. **Monitoramento e Logging**
   - Implementar Sentry para error tracking
   - Configurar logging estruturado
   - Monitoramento de performance (New Relic/DataDog)

3. **Features Adicionais**
   - Integração real com OctoPrint/PrusaLink
   - Sistema de assinaturas recorrentes
   - API pública para integrações
   - Sistema de webhooks customizados

4. **Melhorias de UX**
   - Onboarding guiado para novos usuários
   - Tutoriais interativos
   - Sistema de feedback
   - Melhorias no mobile

## 📝 Notas Importantes

- O projeto agora está 100% funcional com backend real
- Todas as integrações estão configuradas e prontas para uso
- O sistema de cache Redis melhora significativamente a performance
- O dashboard analítico fornece insights valiosos para o negócio
- O sistema de testes garante qualidade do código
- O CI/CD automatiza o processo de deploy

## 🤝 Contribuindo

Este é um projeto comercial. Para contribuições, entre em contato com a equipe de desenvolvimento.

## 📄 Licença

Proprietary - Todos os direitos reservados.

---

**Spartan 3D Print** - Transformando a gestão de impressão 3D