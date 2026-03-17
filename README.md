# VozEmunah Lyrics Sync 🎵 🇮🇱

Este é um projeto **Full-Stack** desenvolvido para automatizar e profissionalizar a criação de legendas para o canal **VozEmunah**. O sistema permite a gestão de músicas judaicas, sincronização de tempos e tradução do hebraico para o português, com exportação direta para o formato padrão de legendas (`.srt`).

## 🚀 Status do Projeto: Backend Concluído
O backend foi construído com foco em **Clean Code** e separação de responsabilidades (Controller, Service, Repository, DTO).

### 🛠 Tecnologias Utilizadas
* **Java 21** (LTS)
* **Spring Boot 4.0.3**
* **Spring Data JPA** (Persistência e ORM)
* **PostgreSQL** (Banco de dados relacional)
* **MapStruct** (Mapeamento de objetos/DTOs)
* **Jakarta Validation** (Validação de dados de entrada)
* **Maven** (Gerenciamento de dependências)

### 🏗️ Arquitetura e Funcionalidades Técnicas
* **Padrão REST:** Endpoints otimizados para operações CRUD de faixas e linhas de legenda.
* **Global Exception Handling:** Tratamento centralizado de erros (ex: 404 Resource Not Found) com respostas JSON padronizadas.
* **Lógica de Exportação:** Algoritmo customizado para conversão de milissegundos para o formato de tempo SRT (`00:00:00,000`).
* **Relacionamentos JPA:** Mapeamento One-to-Many entre `Track` (Música) e `LyricLine` (Linha da Legenda).

### 📂 Como rodar o backend localmente
1. Certifique-se de ter o **PostgreSQL** instalado.
2. Crie um banco de dados chamado `syncmanager`.
3. No arquivo `src/main/resources/application.properties`, configure seu `username` e `password` do banco.
4. Execute o projeto via IntelliJ ou terminal:
   ```bash
   mvn spring-boot:run
5. Acesse a API em: http://localhost:8080/api/tracks

🔜 Próximos Passos
[ ] Desenvolvimento do Frontend em Angular (Dashboard e Editor de Sincronia).
[ ] Integração entre Front e Back via REST API.
[ ] Dockerização do projeto.

