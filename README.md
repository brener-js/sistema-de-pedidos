# Sistema de Gestão de Pedidos (SGP) 🍔

Este é um projeto **Monorepo** construído para oferecer um Sistema de Gestão de Pedidos corporativo e completo. Ele conta com um front-end moderno, um back-end robusto, integração com banco de dados em tempo real e deploys automatizados baseados em pipelines rigorosos.

O projeto foi arquitetado focado em duas "personas" no sistema:
- **Cliente**: Interface limpa em Dark Mode. Pode criar conta via e-mail, realizar pedidos customizados, editar itens de pedidos, solicitar cancelamentos (exclusão) enquanto no status Pendente, e visualizar o fluxo em Tempo Real.
- **Administrador**: Dashboard unificado. Visão panorâmica para ler dezenas de pedidos da plataforma e evoluí-los dentro da esteira de etapas (*Pendente, Em Preparo, Enviado, Entregue*).

## 🛠️ Tecnologias e Stack

### 💻 Frontend (Client Interface)
- **[React](https://react.dev/) + [Vite](https://vitejs.dev/)**: Motor moderno responsável por renderizar as interfaces gráficas sem Reloads de forma super-rápida.
- **[Tailwind CSS](https://tailwindcss.com/)**: Ferramenta de estilo ágil para um layout profissional, com design system construído prioritariamente para *Dark Mode*.
- **[Shadcn UI](https://ui.shadcn.com/)**: Conjunto de componentes React reutilizáveis (*Buttons, Dialog, Tabs, Selects*), extremamente consistentes com design premium.
- **Lucide React**: Biblioteca de iconografia limpa.
- **React Router DOM**: Gerenciamento das rotas das páginas da nossa SPA (Single Page Application).

### ⚙️ Backend (API e Motor Central)
- **[Node.js](https://nodejs.org/) / [Express.js](https://expressjs.com/)**: Gerenciamento de rotas e segurança via middleware, interpretando e filtrando ações antes de chegarem ao banco de dados.
- **[Supabase](https://supabase.com/)**: Backend-as-a-Service utilizado de forma intensiva no aplicativo:
  - **Banco de Dados**: PostgreSQL puro trabalhando dados relacionais (`users`, `orders`, `status_history`).
  - **Autenticação**: Gerenciador de Logins atuando fornecendo Tokens JWT criptografados invioláveis.
  - **Tempo Real**: Canais de WebSockets subscritos no Dashboard em React para piscar/atualizar modificações do servidor nos painéis visuais sem atualizar o F5.
- **[Swagger](https://swagger.io/)**: Open API automática nas rotas. Interface de testes instalada nativamente sob a URL interna `/api-docs`.
- **[Jest](https://jestjs.io/) e Supertest**: Bateria de validações de testes automatizados que cobrem as requisições API antes dela ir ao ar.

### 🚀 CI/CD e Infra Cloud (Nuvem)
- **[GitHub Actions](https://github.com/features/actions)**: Pipeline acionada nos 'pushes'. Testam a saúde do NodeJS e batem nos webhooks dos servidores de Nuvem se tudo brilhar na cor verde.
- **[Vercel](https://vercel.com/)**: Servidor front-end que serve nossa malha em React (Tratada na raiz com re-escrita via `vercel.json`).
- **[Render.com](https://render.com/)**: Motor contíguo que processa Node+Docker e roda nossa Express API 24/7.

## 🔒 Segurança Nativa (RLS)
Nossas requisições contam com proteção de tridimensional construída sobre **RLS** *(Row-Level Security)* de Banco de Dados:
- Apenas Clientes donos podem Inserir, Deletar ou Modificar propriedades em seus Pedidos (Validado backend `auth.uid()`).
- O servidor Express.js captura o Token do usuário no cliente e passa magicamente adiante em forma de "Proxy" protegido nas transações DB para habilitar as proteções acima.
- O privilégio para injetar Historio de Transações é rígido unicamente à flag `role = 'Administrador'` gravada no PostgreSQL.


---

## 🛠⚙️  Como Configurar as Variáveis do Projeto (Instalação Local)

Siga os seguintes passos para rodar o SGP na sua própria máquina de testes:

### Passo 1: O Backend (A Alma do Servidor)
1. Abra um terminal e acesse a raiz do servidor:
```bash
cd backend
npm install
```
2. Crie ou renomeie sua `.env` oficial baseado no template `.env.example` preenchendo as chaves que você obterá lá no seu painel [Supabase](https://supabase.com/):
```env
# /backend/.env
PORT=3000
SUPABASE_URL=https://SUA-CHAVE-DO-PROJETO.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI...
```
3. Ligue o motor do backend:
```bash
npm run dev
```

### Passo 2: O Frontend (A Cara do Projeto)
1. Em outra nova aba do seu terminal (não feche a do backend!), vá para o cliente:
```bash
cd frontend
npm install
```
2. Na sua aba de frontend, crie sua `.env` baseando-se no arquivo modelo `frontend/.env.example` contendo a rota e chaves:
```env
# /frontend/.env
VITE_SUPABASE_URL=https://SUA-CHAVE-DO-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI...
VITE_API_BASE_URL=http://localhost:3000
```
3. Construa a tela em modo Servidor Local:
```bash
npm run dev
```

> **Aviso de Acesso para Desenvolvimento Rápido**: O projeto Frontend vai subir na porta de host comum do Vite. Acesse a tela, clique em "Criar Conta". Você pode simular o "Administrador mestre" alterando sua flag de status na aba Supabase > *SQL Editor* / *Table Editor* da public.users.
