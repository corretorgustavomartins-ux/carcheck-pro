# 🚗 Carcheck Pro

> **O Serasa dos carros usados.** Descubra em segundos se o carro é bomba antes de comprar.

## 🎯 Sobre o Produto

Sistema SaaS web completo para consulta veicular com Score Anti-Bomba, Preço Justo IA e sistema de créditos.

**Proposta de valor:** Ajudar compradores de carros usados a evitar golpes e superpagamentos através de um relatório SMART completo.

---

## ✅ Funcionalidades Implementadas

### Frontend
- ✅ **Landing Page de alta conversão** com hero, como funciona, o que é analisado, pricing, depoimentos e FAQ
- ✅ **Campo de placa** com validação em tempo real (Mercosul e formato antigo)
- ✅ **Prévia grátis** com dados básicos do veículo
- ✅ **Tela de compra de créditos** com 3 pacotes + PIX
- ✅ **Dashboard do usuário** com histórico, saldo e nova consulta
- ✅ **Relatório SMART completo** com score, alertas e preço justo
- ✅ **Download de PDF** profissional do relatório
- ✅ **Autenticação** com Supabase Auth (Google + email)
- ✅ **Design responsivo** mobile-first com Tailwind CSS

### Backend / APIs
- ✅ `POST /api/vehicle/report` — salvar relatório e deduzir créditos
- ✅ `POST /api/payment/create` — criar pagamento PIX (Mercado Pago + mock)
- ✅ `GET /api/payment/status` — verificar status do pagamento com polling
- ✅ `POST /api/payment/webhook` — webhook Mercado Pago
- ✅ `GET /api/user/me` — dados completos do usuário
- ✅ `GET /api/credits/balance` — saldo de créditos

### Engines de análise
- ✅ **Score Engine** — calcula score 0-100 baseado em sinistro, gravame, restrições e idade
- ✅ **Pricing Engine** — calcula preço justo com desconto por risco
- ✅ **Vehicle Service** — camada de abstração para API externa (mockada)
- ✅ **PDF Generator** — gera PDF profissional com jsPDF

### Banco de dados (Supabase)
- ✅ `profiles` — perfil do usuário
- ✅ `credit_wallets` — saldo de créditos com proteção contra negativo
- ✅ `transactions` — histórico de compras
- ✅ `vehicle_reports` — consultas realizadas com payload completo
- ✅ `monitored_vehicles` — veículos monitorados (base preparada)
- ✅ Triggers automáticos para criação de perfil e carteira
- ✅ Funções RPC `deduct_credits` e `add_credits`

---

## 🌐 URLs

| Página | URL |
|--------|-----|
| Landing Page | `/` |
| Resultado (prévia grátis) | `/resultado?placa=ABC1D23` |
| Comprar créditos | `/comprar` |
| Login/Cadastro | `/login` |
| Dashboard | `/dashboard` |
| Consulta SMART | `/consulta?placa=ABC1D23` |

---

## 💳 Pacotes de Créditos

| Pacote | Créditos | Preço | Consultas |
|--------|----------|-------|-----------|
| Inicial | 16 | R$ 15,99 | 1 |
| Recomendado ⭐ | 48 | R$ 39,90 | 3 |
| Inteligente | 100 | R$ 69,90 | 6+ |

---

## 🗄️ Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Landing page
│   ├── layout.tsx          # Layout raiz
│   ├── resultado/          # Prévia grátis
│   ├── comprar/            # Compra de créditos
│   ├── consulta/           # Relatório SMART
│   ├── dashboard/          # Dashboard do usuário
│   ├── login/              # Autenticação
│   └── api/                # API Routes
│       ├── vehicle/        # Consulta veicular
│       ├── payment/        # Pagamentos PIX
│       ├── credits/        # Créditos
│       └── user/           # Dados do usuário
├── components/
│   ├── ui/                 # Button, Card, PlateInput, ScoreMeter
│   ├── layout/             # Header, Footer
│   ├── landing/            # HeroSection, Sections, PricingSection
│   ├── dashboard/          # Componentes do dashboard
│   └── vehicle/            # Componentes de veículo
├── lib/
│   ├── supabase/           # Client e Server Supabase
│   ├── score-engine.ts     # Motor de score anti-bomba
│   ├── pricing-engine.ts   # Motor de preço justo IA
│   ├── vehicle-service.ts  # Serviço de consulta veicular
│   ├── credit-packages.ts  # Definição dos pacotes
│   ├── pdf-generator.ts    # Gerador de PDF
│   └── utils.ts            # Utilitários
└── types/
    └── index.ts            # Tipos TypeScript
```

---

## 🔧 Setup e Configuração

### 1. Variáveis de Ambiente

Copie `.env.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
MERCADO_PAGO_ACCESS_TOKEN=seu-token-mp
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
```

### 2. Banco de Dados Supabase

Execute o arquivo `src/lib/database/schema.sql` no SQL Editor do Supabase.

### 3. Autenticação Google (Supabase)

1. Acesse Supabase > Authentication > Providers
2. Ative o Google Provider
3. Configure o Client ID e Secret do Google Cloud Console

### 4. Mercado Pago PIX

1. Crie conta no Mercado Pago Developers
2. Gere um Access Token de produção
3. Configure o webhook em: `https://seu-dominio.com/api/payment/webhook`

---

## 🚀 Integração API Externa

Para conectar uma API real de consulta veicular, edite `src/lib/vehicle-service.ts`:

```typescript
// Substitua o mock por sua API real
static async getFullReport(plate: string): Promise<VehicleData | null> {
  const response = await fetch(`https://sua-api.com/v1/veiculos/${plate}`, {
    headers: { 'Authorization': `Bearer ${process.env.VEICULO_API_KEY}` }
  })
  return response.json()
}
```

A estrutura esperada está definida em `src/types/index.ts` → `VehicleData`.

---

## 🛠️ Tecnologias

- **Next.js 16** com App Router
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Auth + PostgreSQL + Storage)
- **Mercado Pago** (PIX)
- **jsPDF** (geração de PDF)
- **react-hot-toast** (notificações)

---

## 📋 Próximos Passos Sugeridos

- [ ] Conectar API real de consulta veicular (Detran/Placafipe/etc)
- [ ] Implementar monitoramento de veículos (tabela já criada)
- [ ] Adicionar página de perfil do usuário
- [ ] Implementar histórico de transações no dashboard
- [ ] Adicionar gráficos de score no relatório
- [ ] Integrar WhatsApp para envio do relatório
- [ ] Implementar SEO dinâmico por consulta
- [ ] Adicionar Google Analytics / Hotjar
- [ ] Criar painel administrativo

---

*© 2024 Carcheck Pro — Todos os direitos reservados*
