# 📅 Turnus (Gestão de Escalas SAAE)

<br>
<p align="center">
<img src="src/resources/logo1.png" alt="Logo SAAE" width="150"/>
</p>

## Sobre o Projeto

O **Turnus** é uma ferramenta de software **desktop** dedicada à **gestão e automação das escalas de plantão** dos funcionários do Serviço Autônomo de Água e Esgoto (SAAE).

Seu objetivo é **eliminar o esforço manual e os erros** na criação e gerenciamento de duas escalas mensais simultâneas (como para encanadores e outros colaboradores). A solução garante que as restrições de alocação de pessoal (como horários e funcionários em comum) sejam respeitadas, assegurando a cobertura necessária no horário de plantão (das 13h às 19h).

### O Problema que Resolvemos

A criação e gerenciamento manual de **duas escalas de plantão mensais distintas** (para diferentes setores, como ETA), com regras e restrições específicas (como o funcionário Gideone, que se repete em ambas), é uma tarefa árdua e propensa a erros. Isso resulta em atrasos, potencial choque de horários e alto esforço manual para gerar a escala final com a identidade visual do SAAE para impressão.

### O Principal Diferencial

Nosso produto automatiza a criação e gestão, aplicando restrições que previnem o choque de alocação. O **principal diferencial** é a capacidade de **exportar o relatório final em PDF pronto para impressão**, já seguindo o padrão e identidade visual (logo) do SAAE.

<img width="1351" height="652" alt="image" src="https://github.com/user-attachments/assets/c3807b1f-dd55-4e1f-8e0d-89a4acf6b723" />

## 🚀 Funcionalidades Implementadas (Sprint 2)

Com base no progresso da equipe, as seguintes funcionalidades foram desenvolvidas ou estão em andamento:

* **Autenticação:**
    * Implementação completa do back-end da tela de login.
    * Desenvolvimento e integração do front-end da tela de login.
* **Gerenciamento de Funcionários:**
    * Implementação do back-end para a listagem de funcionários.
    * Desenvolvimento do front-end da tela de listagem, incluindo componentização em React e estilização CSS.
    * Lógica de busca e filtro de funcionários implementada no front-end.
* **Infraestrutura e Banco de Dados:**
    * Configuração de um banco de dados SQLite acoplado para simplificar a integração.
    * Configuração de migrações de banco de dados para garantir um ambiente homogêneo para os desenvolvedores.
* **Design e Modelagem (Em Andamento):**
    * Prototipação das telas de CRUD de funcionários.
    * Modelagem do banco de dados (Diagrama ER) e Diagrama de Classes, com alinhamento sobre as regras de restrição.

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando o ecossistema JavaScript moderno, com foco em uma aplicação desktop multiplataforma.

- **Framework Desktop:** `Electron`
- **Interface Gráfica (UI):** `React`
- **Build Tool:** `Vite`
- **Linguagem Principal:** `JavaScript`
- [cite_start]**Banco de Dados:** `SQLite` [cite: 22]
- **Estilização:** `CSS Puro`
- **Geração de PDF:** `(A ser definido)`


## ⚙️ Como Executar o Projeto (Instalação)

Siga estas instruções para obter uma cópia do projeto em operação na sua máquina local.

### Pré-requisitos

Para rodar o projeto, você precisará ter instalado:

- **Node.js**: `v22.x` (LTS) ou superior.
- **npm**: `v10.x` ou superior (geralmente instalado junto com o Node.js).

### Instalação

1.  **Clone o repositório** para a sua máquina local:

    ```bash
    git clone https://github.com/pamellaneco/Projeto_Integrado1_Time1.git
    cd Projeto_Integrado1_Time1
    ```

2.  **Instale as dependências**:

    ```bash
    npm install
    ```

3.  **Execute a aplicação:**

    ```bash
    npm start
    ```

## ✒️ Autores

Projeto desenvolvido pelo Time 1 da disciplina de Projeto Integrado.

| Nome | GitHub | LinkedIn |
| :--- | :--- | :--- |
| **Ana Julia Chaves** | [liapsps](https://github.com/liapsps) | [in/juliaentrechaves](https://www.linkedin.com/in/juliaentrechaves) |
| **Gabriela Coutinho**| [gbrlcoutinho](https://github.com/gbrlcoutinho) | [in/gbrlcoutinho](https://www.linkedin.com/in/gbrlcoutinho) |
| **Luiz Henrique Sena** | [HenriqueSenaDev](https://github.com/HenriqueSenaDev) | [in/luiz-henrique-nunes-sena](https://www.linkedin.com/in/luiz-henrique-nunes-sena-002a4829b) |
| **Pâmella Kyrla Neco** | [pamellaneco](https://github.com/pamellaneco) | [in/pamellakyrla](https://www.linkedin.com/in/pamellakyrla) |
| **Paulo Sérgio Oliveira** | [Paulo-Sergio-Oliveira](https://github.com/Paulo-Sergio-Oliveira) | [in/paulo-sergio-vieira-oliveira](https://www.linkedin.com/in/paulo-sergio-vieira-oliveira-695200281/) |
