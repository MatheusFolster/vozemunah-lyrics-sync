# 🎵 VozEmunah Lyrics Sync (MVP Full-Stack)

Uma solução profissional **Full-Stack** desenvolvida para automatizar e gerenciar a sincronização de legendas de músicas religiosas judaicas. Esta ferramenta permite a marcação precisa de tempos (milissegundos) e a tradução do hebraico para o português, com um motor customizado para exportação de legendas no formato padrão `.srt`.

---

## 🚀 Status do Projeto: MVP Funcional
Este repositório serve como um estudo de caso técnico focado em manipulação de mídia e integração complexa entre Spring Boot e Angular.

### 🏆 Desafios Técnicos Superados (Estudo de Caso)
Este projeto foi um mergulho profundo na infraestrutura Full-Stack, resolvendo obstáculos reais de desenvolvimento:

* **Gerenciamento Avançado de CORS:** Configuração de um `CorsFilter` global para suportar requisições de pré-fluxo (OPTIONS) e suporte a múltiplos métodos (PUT/POST/DELETE), garantindo a comunicação segura entre o frontend Angular (porta 4200) e o backend Spring Boot (porta 8080).
* **Streaming e Armazenamento de Mídia:** Implementação de um sistema robusto de upload `multipart/form-data` com armazenamento persistente em disco. Configuração de `ResourceHandlers` para servir arquivos externos como recursos estáticos, permitindo o streaming de áudio em tempo real para o player.
* **Integração Spring Boot 3 + Java 21:** Utilização das últimas funcionalidades do Java e padrões do Spring Boot 3 para tratamento de exceções, mapeamento de dados (MapStruct) e arquitetura RESTful.
* **Sincronização Precisa de Tempo:** Lógica desenvolvida no frontend para capturar timestamps em tempo real da API de áudio do HTML5 e sincronizá-los com o motor de geração de SRT no backend.

---

### 🛠 Tecnologias Utilizadas
* **Backend:** Java 21, Spring Boot 3.x, Spring Data JPA, Hibernate.
* **Banco de Dados:** PostgreSQL (Armazenamento relacional de faixas e linhas de legenda).
* **Frontend:** Angular 17+, RxJS, CSS3 (Player de Áudio Customizado e Editor).
* **Ferramentas:** Maven, MapStruct, Jakarta Validation, Git Bash.

---

### 📂 Como Executar Localmente

#### 1. Backend (Spring Boot)
1. Certifique-se de ter o **PostgreSQL** instalado e crie um banco de dados chamado `syncmanager`.
2. No arquivo `src/main/resources/application.properties`, atualize seu `username` e `password` do banco.
3. Adicione a linha do diretório de upload: `app.upload.dir=./uploads/audio`
4. Execute a aplicação via IntelliJ ou terminal:
   ```bash
   mvn spring-boot:run

#### 1. Frontend (Angular)
1. Navegue até a pasta do frontend via terminal.
2. Instale as dependências do projeto: npm install
3. Inicie o servidor de desenvolvimento: ng serve
4. Acesse o sistema em: http://localhost:4200
