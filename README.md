<p align="center">
  <img src="media/banner-gif-pneu.gif" alt="NexDrive - Marketplace & Locação de Veículos" width="100%" />
</p>

# NexDrive

> Plataforma full-stack de marketplace automotivo e gestão de locação de veículos no Brasil, integrando catálogo dinâmico, reservas em tempo real, autenticação segura e suporte a vendas.

<p align="left">
  <img src="https://img.shields.io/badge/build-passing-brightgreen.svg" alt="Build Status" />
  <img src="https://img.shields.io/badge/Java-21-orange.svg" alt="Java 21" />
  <img src="https://img.shields.io/badge/Spring%20Boot-3.5.7-brightgreen.svg" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Angular-21.2-red.svg" alt="Angular" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL%20%2F%20Neon-blue.svg" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License" />
</p>

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
- [Segurança & LGPD](#segurança--lgpd)
- [Como Contribuir](#como-contribuir)
- [Licença](#licença)

---

## Visão Geral

O **NexDrive** é uma plataforma corporativa e moderna projetada para conectar locatários, compradores e vendedores de veículos em território brasileiro. A solução combina uma arquitetura backend robusta e escalável em **Spring Boot 3 (Java 21)** com persistência em nuvem serverless no **PostgreSQL (Neon DB)** e um frontend responsivo e dinâmico em **Angular 21**.

---

## Ofertas & Campanhas Promocionais

Peças visuais e campanhas em destaque integradas ao ecossistema:

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

- **Catálogo Inteligente**: Listagem paginada com múltiplos filtros combináveis (Marca, Categoria, Transmissão, Combustível, Faixa de Preço e Cidade/Estado).
- **Motor de Locação (Rental Wizard)**: Cálculo automatizado de diárias em tempo real, validação anti-sobreposição de agendamentos e contratação de adicionais (Seguro Completo +15% e Condutor Extra).
- **Autenticação e Segurança**: Acesso via credenciais padrão e Google OAuth2, tokens JWT de curta duração com rotação de Refresh Tokens via cookies `httpOnly`, criptografia de senhas com BCrypt e controle de acesso baseado em papéis (RBAC).
- **Painel do Usuário**: Gestão de perfil, histórico completo em *"Minhas Reservas"*, cancelamento de solicitações e favoritos.
- **Comunidade & Fórum**: Espaço para compartilhamento de experiências, tópicos de discussão e avaliações com nota e comentário (*Reviews*).
- **Anúncio & Venda de Veículos**: Formulário guiado para usuários anunciarem veículos para comercialização.
- **Abrangência Nacional**: Cobertura integrada com cidades e capitais brasileiras em mais de 12 estados.

---

## Material Promocional do Sistema

Apresentação gráfica destacando a interface de navegação, a vitrine de veículos e a identidade do produto:

<p align="center">
  <img src="media/system-dashboard.png" alt="NexDrive - Material Promocional do Sistema" width="100%" />
</p>

---

## Telas do Sistema

### 1. Fluxo de Reserva - Período e Local (R1)
Seleção do intervalo de datas e definição dos pontos de retirada e devolução do veículo:

<p align="center">
  <img src="media/R1.png" alt="Etapa 1 do Rental Wizard - Datas e Localidade" width="100%" />
</p>

### 2. Fluxo de Reserva - Proteção e Opcionais (R2)
Configuração de serviços complementares e pré-visualização discriminada de custos:

<p align="center">
  <img src="media/R2.png" alt="Etapa 2 do Rental Wizard - Adicionais e Resumo de Custos" width="100%" />
</p>

### 3. Fórum & Comunidade Automotiva
Canal interativo de troca de informações e avaliações entre membros da plataforma:

<p align="center">
  <img src="media/Forum.png" alt="Fórum da Comunidade NexDrive" width="100%" />
</p>

---

## Stack Técnica

### Backend
- **Linguagem & Runtime**: Java 21 LTS
- **Framework Base**: Spring Boot 3.5.7
- **Persistência**: Spring Data JPA & Hibernate 6.6
- **Segurança**: Spring Security 6, Spring OAuth2 Client, JJWT 0.12.6, BCrypt
- **Documentação de API**: SpringDoc OpenAPI / Swagger UI 2.8.5
- **Pool de Conexões**: HikariCP com timeout fail-fast

### Frontend
- **Framework Base**: Angular 21.2 (Standalone Architecture, Signals & Computed State)
- **UI & Componentes**: Angular Material 21, CDK, Lucide Icons, Heroicons, Ngx-Toastr
- **Comunicação Assíncrona**: HttpClient, RxJS 7.8
- **Estilização**: SCSS com Glassmorphism e CSS Variables para temas

### Infraestrutura & Banco de Dados
- **Banco de Dados**: PostgreSQL 16 (Neon Serverless Cloud)
- **Containerização**: Docker (Multi-stage build unificado)
- **Hospedagem & Deploy**: Suporte a Render via `render.yaml`

---

## Estrutura do Projeto

```text
backend/
├── pom.xml                               # Configuração e dependências Maven do backend
├── Dockerfile                            # Build multi-stage unificado (Angular + Spring Boot)
├── render.yaml                           # Especificação de deploy automatizado no Render
├── .env                                  # Variáveis de ambiente locais (ignorado no versionamento)
├── media/                                # Ativos visuais e capturas de tela da documentação
│   ├── banner-gif-pneu.gif               # Banner animado principal do cabeçalho
│   ├── promo-sale-01.png                 # Peça promocional 01
│   ├── promo-sale-02.png                 # Peça promocional 02
│   ├── promo-sale-03.png                 # Peça promocional 03
│   ├── system-dashboard.png              # Material promocional do ecossistema NexDrive
│   ├── R1.png                            # Rental Wizard - Passo 1 (Datas e Local)
│   ├── R2.png                            # Rental Wizard - Passo 2 (Opcionais e Resumo)
│   └── Forum.png                         # Tela da Comunidade e Fórum
├── src/
│   ├── main/
│   │   ├── java/br/com/unipaulistana/rentacar/backend/
│   │   │   ├── config/                   # Segurança, JWT, CORS, OAuth2, DataInitializer, OpenAPI
│   │   │   ├── domain/                   # Entidades JPA (Vehicle, User, Rental, Review, Favorite, etc.)
│   │   │   ├── dto/                      # Data Transfer Objects para requests/responses
│   │   │   ├── exception/                # Tratamento global de exceções e respostas de erro
│   │   │   ├── presentation/             # REST Controllers (Auth, Vehicle, Rental, User, etc.)
│   │   │   ├── repository/               # Interfaces Spring Data JPA
│   │   │   └── service/                  # Lógica de negócio e serviços transacionais
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

- **Java JDK 21** instalado e acessível no terminal
- **Node.js 20+** e **npm 10+**
- **Maven 3.9+** (ou utilizar o wrapper `./mvnw` incluso)
- Instância ativa do **PostgreSQL** (local ou Neon DB)

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes chaves de configuração:

| Variável | Descrição | Exemplo / Padrão |
| :--- | :--- | :--- |
| `DB_HOST` | Host do banco PostgreSQL | `localhost` ou `ep-xyz.sa-east-1.aws.neon.tech` |
| `DB_PORT` | Porta de conexão do PostgreSQL | `5432` |
| `DB_NAME` | Nome do banco de dados | `neondb` |
| `DB_USER` | Usuário do banco | `neondb_owner` |
| `DB_PASS` | Senha de autenticação do banco | `********` |
| `DB_SSLMODE` | Modo SSL do driver JDBC | `require` ou `disable` |
| `JWT_SECRET` | Chave secreta HMAC (mínimo 256 bits) | `404E635266556A586E3272357538782F...` |
| `JWT_EXPIRATION` | Tempo de expiração do access token (ms) | `900000` (15 min) |
| `ALLOWED_ORIGINS` | Origens CORS autorizadas | `http://localhost:4200` |
| `GOOGLE_CLIENT_ID` | Client ID para autenticação Google OAuth2 | `seu-google-client-id` |
| `GOOGLE_CLIENT_SECRET` | Client Secret para Google OAuth2 | `seu-google-client-secret` |
| `PORT` | Porta HTTP do servidor Spring Boot | `8080` |

---

## Como Rodar Localmente

### 1. Backend (Spring Boot)

1. Preencha o arquivo `.env` na raiz do repositório com credenciais válidas do PostgreSQL.
2. Inicie a aplicação através do Maven Wrapper:

```bash
# Linux / macOS
./mvnw spring-boot:run

# Windows (PowerShell)
.\mvnw.cmd spring-boot:run
```

A API REST estará disponível em: `http://localhost:8080`.

### 2. Frontend (Angular)

1. Navegue até o diretório do frontend:
```bash
cd autohunt-web
```

2. Instale as dependências do projeto:
```bash
npm install --legacy-peer-deps
```

3. Inicie o servidor de desenvolvimento com o proxy reverso habilitado:
```bash
npm start
```

A aplicação web estará acessível em: `http://localhost:4200`.

### 3. Execução Unificada via Docker

Para compilar e executar o backend e o frontend em um único container de produção:

```bash
# Build da imagem unificada
docker build -t nexdrive-app .

# Execução do container passando o arquivo .env
docker run -d -p 8080:8080 --env-file .env --name nexdrive nexdrive-app
```

---

## Documentação da API (Swagger/OpenAPI)

Com o backend em execução, a documentação interativa com endpoints e esquemas de dados está disponível em:

- **Swagger UI**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **OpenAPI JSON Spec**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

## Segurança & LGPD

- **Proteção PII & LGPD**: Logs de SQL desativados por padrão em produção para impedir exposição de dados sensíveis (CPF, telefone, credenciais).
- **Estratégia de Conexão Fail-Fast**: Configuração estrita de timeouts no HikariCP para evitar travamentos com instâncias serverless.
- **Ciclo de Vida de Tokens**: Access Tokens de curta duração (15 min) e Refresh Tokens rotativos persistidos em cookies seguros (`httpOnly`, `SameSite=Strict`).

---

## Como Contribuir

1. Faça um Fork do repositório.
2. Crie uma branch dedicada para sua feature ou correção:
   ```bash
   git checkout -b feature/minha-feature
   ```
3. Realize seus commits seguindo mensagens claras:
   ```bash
   git commit -m "feat: adiciona filtro por tipo de seguro na locação"
   ```
4. Envie as alterações para o seu repositório remoto:
   ```bash
   git push origin feature/minha-feature
   ```
5. Abra um **Pull Request** descrevendo as mudanças e testes realizados.

---

## Licença

Distribuído sob a licença [MIT](LICENSE).