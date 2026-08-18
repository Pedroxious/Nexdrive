<p align="center">
  <img src="https://i.imgur.com/lIis4sr.gif" alt="NexDrive Banner" width="100%" />
</p>

# NexDrive

> Plataforma full-stack de marketplace automotivo e gestão de locação de veículos no Brasil, integrando catálogo dinâmico, reservas em tempo real, autenticação segura e suporte a vendas.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.7-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-21.2-red.svg)](https://angular.dev/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20Neon-blue.svg)](https://neon.tech/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## Sumário

- [Visão Geral](#visão-geral)
- [Ofertas & Campanhas Promocionais](#ofertas--campanhas-promocionais)
- [Principais Funcionalidades](#principais-funcionalidades)
- [Material Promocional do Sistema](#material-promocional-do-sistema)
- [Telas do Sistema](#telas-do-sistema)
  - [1. Fluxo de Reserva - Período e Local (R1)](#1-fluxo-de-reserva---período-e-local-r1)
  - [2. Fluxo de Reserva - Proteção e Opcionais (R2)](#2-fluxo-de-reserva---proteção-e-opcionais-r2)
  - [3. Fórum & Comunidade Automotiva](#3-fórum--comunidade-automotiva)
- [Stack Técnica](#stack-técnica)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Como Rodar Localmente](#como-rodar-localmente)
  - [1. Backend (Spring Boot)](#1-backend-spring-boot)
  - [2. Frontend (Angular)](#2-frontend-angular)
  - [3. Execução Unificada via Docker](#3-execução-unificada-via-docker)
- [Documentação da API (Swagger/OpenAPI)](#documentação-da-api-swaggeropenapi)
- [Segurança](#segurança)
- [Como Contribuir](#como-contribuir)
- [Licença](#licença)

---

## Visão Geral

O **NexDrive** é uma solução completa para locação e compra/venda de veículos. A arquitetura conecta um backend RESTful em Spring Boot 3 com persistência em PostgreSQL (Neon Serverless) a uma Single Page Application (SPA) em Angular 21 com design moderno, SSR opcional e proxy de desenvolvimento configurado.

---

## Ofertas & Campanhas Promocionais

Vitrine de campanhas sazonais e promoções em destaque disponíveis diretamente na plataforma:

<p align="center">
  <img src="media/promo-sale-01.png" alt="Promo Sale 01 - Oferta Especial de Locação" width="100%" />
</p>

<p align="center">
  <img src="media/promo-sale-02.png" alt="Promo Sale 02 - Condições Exclusivas de Compra e Venda" width="100%" />
</p>

<p align="center">
  <img src="media/promo-sale-03.png" alt="Promo Sale 03 - Descontos em Veículos Premium e SUVs" width="100%" />
</p>

---

## Principais Funcionalidades

- **Catálogo de Veículos**: Listagem paginada e filtros avançados por marca, categoria (Economy, Compact, SUV, Sport, Luxury, Van), combustível, transmissão, faixa de preço e localização.
- **Motor de Locação (Rental Wizard)**: Cálculo dinâmico de diárias, verificação de sobreposição de datas, opcionais de seguro (+15%) e condutor adicional.
- **Autenticação & Autorização**: Login por credenciais e Google OAuth2, JWT Stateless (Access Token curto com rotação via Refresh Token em cookie httpOnly), criptografia BCrypt e controle RBAC (User/Admin).
- **Gestão de Usuário**: Perfis, histórico de reservas ("Minhas Reservas"), cancelamento de locações pendentes e lista de favoritos.
- **Interação Social & Comunidade**: Sistema de avaliações (Reviews), fórum de discussões e notificações em tempo real.
- **Venda de Veículos**: Fluxo para anúncio de carros com validação e submissão.
- **Localidades Brasileiras**: Suporte nativo a múltiplos estados e capitais com busca geolocalizada.

---

## Material Promocional do Sistema

Peça gráfica promocional destacando a interface, a experiência do usuário e os principais recursos do ecossistema NexDrive:

<p align="center">
  <img src="media/system-dashboard.png" alt="NexDrive - Material Promocional do Sistema" width="100%" />
</p>

---

## Telas do Sistema

### 1. Fluxo de Reserva - Período e Local (R1)
Configuração de datas de retirada, devolução e seleção de pontos de atendimento no Brasil:

<p align="center">
  <img src="media/R1.png" alt="Etapa 1 do Rental Wizard - Datas e Localidade" width="100%" />
</p>

### 2. Fluxo de Reserva - Proteção e Opcionais (R2)
Personalização de adicionais, seleção de seguro de cobertura completa e condutor extra com cálculo instantâneo:

<p align="center">
  <img src="media/R2.png" alt="Etapa 2 do Rental Wizard - Adicionais e Resumo de Custos" width="100%" />
</p>

### 3. Fórum & Comunidade Automotiva
Espaço interativo para usuários e proprietários compartilharem experiências, dicas de manutenção e dúvidas:

<p align="center">
  <img src="media/Forum.png" alt="Fórum da Comunidade NexDrive" width="100%" />
</p>

---

## Stack Técnica

### Backend
- **Linguagem & Framework**: Java 21, Spring Boot 3.5.7
- **Acesso a Dados**: Spring Data JPA, Hibernate ORM
- **Segurança**: Spring Security, Spring OAuth2 Client, JJWT (io.jsonwebtoken 0.12.6), BCrypt
- **Documentação**: SpringDoc OpenAPI / Swagger UI (v2.8.5)
- **Pool de Conexões**: HikariCP com fail-fast configurado

### Frontend
- **Framework**: Angular 21.2 (Standalone Components, Signals, Computed state)
- **Design & UI**: Angular Material, CDK, Lucide Icons, Heroicons, SCSS Glassmorphism
- **Comunicação HTTP**: HttpClient com RxJS e Proxy reverso
- **Testes & Build**: Angular CLI, Vite/Vitest

### Infraestrutura & Banco
- **Banco de Dados**: PostgreSQL 16 (Neon Serverless Database)
- **Containerização**: Docker (Multi-stage build com Node 20, Maven 3.9 e Temurin JRE 21)
- **Deploy**: Suporte nativo para Render (`render.yaml`)

---

## Estrutura do Projeto

```text
backend/
├── pom.xml                               # Configuração e dependências Maven do backend
├── Dockerfile                            # Build multi-stage unificado (Angular + Spring Boot)
├── render.yaml                           # Especificação de deploy no Render
├── .env                                  # Variáveis de ambiente locais (ignorado no git)
├── media/                                # Ativos visuais e capturas de tela da documentação
│   ├── promo-sale-01.png                 # Banner promocional 01
│   ├── promo-sale-02.png                 # Banner promocional 02
│   ├── promo-sale-03.png                 # Banner promocional 03
│   ├── system-dashboard.png              # Material promocional do ecossistema NexDrive
│   ├── R1.png                            # Rental Wizard - Passo 1 (Datas e Local)
│   ├── R2.png                            # Rental Wizard - Passo 2 (Opcionais e Resumo)
│   └── Forum.png                         # Tela da Comunidade e Fórum
├── src/
│   ├── main/
│   │   ├── java/br/com/unipaulistana/rentacar/backend/
│   │   │   ├── config/                   # Security, JWT, CORS, OAuth2, DataInitializer, OpenAPI
│   │   │   ├── domain/                   # Entidades JPA (Vehicle, User, Rental, Review, Favorite, etc.)
│   │   │   ├── dto/                      # Data Transfer Objects para requests/responses
│   │   │   ├── exception/                # Handlers globais e exceções de domínio
│   │   │   ├── presentation/             # REST Controllers (Auth, Vehicle, Rental, User, etc.)
│   │   │   ├── repository/               # Interfaces Spring Data JPA
│   │   │   └── service/                  # Regras de negócio e serviços transacionais
│   │   └── resources/
│   │       ├── application.yml           # Configurações do Spring Boot e profiles
│   │       └── static/                   # Assets e build estático do frontend (produção)
└── autohunt-web/                         # Aplicação Frontend Angular
    ├── package.json                      # Dependências e scripts npm
    ├── angular.json                      # Configuração do Angular CLI
    ├── proxy.conf.json                   # Proxy reverso local (/api -> http://localhost:8080)
    └── src/
        └── app/
            ├── components/               # Navbar, Footer, CarCard, SearchBar, Filters, etc.
            ├── core/                     # Guards, Interceptors, Services, Models
            └── pages/                    # Home, Rent, CarDetail, RentalWizard, Profile, Legal, etc.
```

---

## Pré-requisitos

- **Java JDK 21** instalado e configurado no `PATH`
- **Node.js 20+** e **npm 10+**
- **Maven 3.9+** (ou utilizar o wrapper `./mvnw` incluso)
- Instância ativa do **PostgreSQL** ou conta no **Neon DB**

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do repositório (com base no template abaixo):

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `DB_HOST` | Host do banco PostgreSQL | `localhost` ou `ep-xyz.sa-east-1.aws.neon.tech` |
| `DB_PORT` | Porta de conexão do PostgreSQL | `5432` |
| `DB_NAME` | Nome do banco de dados | `neondb` |
| `DB_USER` | Usuário do banco | `neondb_owner` |
| `DB_PASS` | Senha do banco | `********` |
| `DB_SSLMODE` | Modo SSL do driver JDBC | `require` ou `disable` |
| `JWT_SECRET` | Chave secreta HMAC (min 256 bits) | `404E635266556A586E3272357538782F...` |
| `JWT_EXPIRATION` | Tempo de expiração do token (ms) | `900000` (15 min) |
| `ALLOWED_ORIGINS` | Origens CORS permitidas | `http://localhost:4200` |
| `GOOGLE_CLIENT_ID` | Client ID do Google OAuth2 | `seu-google-client-id` |
| `GOOGLE_CLIENT_SECRET` | Client Secret do Google OAuth2 | `seu-google-client-secret` |
| `PORT` | Porta HTTP do servidor Spring | `8080` |

---

## Como Rodar Localmente

### 1. Backend (Spring Boot)

1. Certifique-se de preencher o `.env` na raiz do projeto com credenciais válidas do banco.
2. Execute a aplicação via Maven Wrapper:

```bash
# Linux/macOS
./mvnw spring-boot:run

# Windows (PowerShell)
.\mvnw.cmd spring-boot:run
```

O backend inicializará em `http://localhost:8080`.

### 2. Frontend (Angular)

1. Acesse o diretório do frontend:
```bash
cd autohunt-web
```

2. Instale as dependências:
```bash
npm install --legacy-peer-deps
```

3. Inicie o servidor de desenvolvimento com proxy reverso ativo:
```bash
npm start
```

O frontend estará acessível em `http://localhost:4200` consumindo automaticamente a API local na porta 8080.

### 3. Execução Unificada via Docker

Para rodar toda a aplicação empacotada em container único de produção:

```bash
# Build da imagem
docker build -t nexdrive-app .

# Execução do container passando as variáveis de ambiente
docker run -d -p 8080:8080 --env-file .env --name nexdrive nexdrive-app
```

---

## Documentação da API (Swagger/OpenAPI)

Com o backend em execução, a documentação interativa com endpoints e esquemas de dados está disponível em:

- **Swagger UI**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **OpenAPI JSON Spec**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

## Segurança

- **Proteção de Dados (LGPD)**: Logs SQL desabilitados em produção para evitar vazamento de PII (CPF, telefone, credenciais).
- **Fail-fast de Conexão**: Timeout estrito no HikariCP para prevenção de conexões órfãs com bancos serverless.
- **Tokens Curtos**: Access Tokens com vida útil de 15 minutos e Refresh Tokens rotativos via cookies `httpOnly`, `SameSite=Strict`.

---

## Como Contribuir

1. Faça um Fork do projeto.
2. Crie uma branch para sua funcionalidade ou correção:
   ```bash
   git checkout -b feature/minha-feature
   ```
3. Realize commits claros e objetivos:
   ```bash
   git commit -m "feat: adiciona filtro por tipo de seguro na locação"
   ```
4. Envie as alterações para seu repositório:
   ```bash
   git push origin feature/minha-feature
   ```
5. Abra um **Pull Request** detalhando as alterações propostas e testes efetuados.

---

## Licença

Este projeto está sob a licença [MIT](LICENSE).