# ERP (Planejamento de Recursos Empresariais)

 1. Visão Geral
 2. Tecnologias da Aplicação
 3. Estrutura do Projeto
 <!-- 4. Banco de Dados e RLS
 5. Funções e Triggers do Supabase
 6. Regras de Permissão no Código
 7. Deploy e Ambientes
 8. Fluxos Principais
 9. Contribuição e Boas Práticas
 10. Roadmap / Melhorias Futuras -->

---

### 1. Visão Geral

O objetivo é centralizar todas as informações da empresa em um só lugar. Este projeto se iniciou após um cliente solicitar a produção de um sistema que torna-se automático, o que ainda era manual em sua loja. Nele é possível criar vendas, gerenciar pedidos e estoque de produtos, acompanhar status de produção e métricas de vendas em tempo real.

---

### 2. Tecnologias da Aplicação

| Componente | Tecnologia | Função 
| ----------- | ----------- | ----------- |
| **Frontend** | Next.js + TypeScript | Interface moderna e performática |
| **Backend** | Supabase (PostgreSQL + Auth + RLS) | Banco, autenticação e permissões |
| **ORM** | Supabase Client (sem Prisma) | Comunicação direta via RLS |
| **Estilização** | TailwindCSS + clsx | Praticidade e rapidez para estilizar |
| **Hospedagem** | Vercel (frontend), Supabase (backend) | Infra de produção |

---

### 3. Estrutura do Projeto

```
/app
├ ├─ (auth)               → Ações de autenticação
├ ├─ (app)                → Aplicação após autenticação
├ ├ ├─ /customers           → Página de clientes
├ ├ ├─ /dashboard           → Página principal do projeto
├ ├ ├─ /products            → Página de produtos
├ ├ ├─ /orders              → Página de pedidos
├ ├ └─ /sales               → Página de vendas
├ ├─ /actions             → Ações do servidor
├ ├─ /components          → Componentes reutilizáveis
├ └─ /login               → Página de login
├─ /types                → Tipos TypeScript globais
├─ /utils                → Funções auxiliares

