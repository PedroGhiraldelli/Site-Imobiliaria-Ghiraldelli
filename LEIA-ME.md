# 🏠 Ghiraldelli Imobiliária — Guia Completo de Instalação e Uso

---

## ÍNDICE

1. [Pré-requisitos](#1-pré-requisitos)
2. [Instalação do Node.js](#2-instalação-do-nodejs)
3. [Instalação do MySQL](#3-instalação-do-mysql)
4. [Configuração do Projeto](#4-configuração-do-projeto)
5. [Iniciando o Servidor](#5-iniciando-o-servidor)
6. [Acesso ao Site e Painel Admin](#6-acesso-ao-site-e-painel-admin)
7. [Como Usar o Painel Admin](#7-como-usar-o-painel-admin)
8. [Personalizações Importantes](#8-personalizações-importantes)
9. [Hospedagem em Produção](#9-hospedagem-em-produção)
10. [Solução de Problemas](#10-solução-de-problemas)

---

## 1. Pré-requisitos

Antes de começar, você vai precisar ter instalado:

| Software    | Versão mínima | Download |
|-------------|---------------|----------|
| Node.js     | 18 ou superior | nodejs.org |
| MySQL       | 8.0 ou superior | dev.mysql.com/downloads |
| npm         | Vem junto com o Node.js | — |

> **Dica:** Para verificar se já tem instalado, abra o terminal e execute:
> ```
> node --version
> npm --version
> mysql --version
> ```

---

## 2. Instalação do Node.js

1. Acesse **nodejs.org** e baixe a versão **LTS** (recomendada)
2. Execute o instalador e siga os passos (clique em "Next" em tudo)
3. Após instalar, abra o **Prompt de Comando** (cmd) e teste:
   ```
   node --version
   ```
   Deve aparecer algo como: `v20.11.0`

---

## 3. Instalação do MySQL

### Opção A — MySQL Installer (mais fácil para Windows)

1. Acesse **dev.mysql.com/downloads/installer**
2. Baixe o **MySQL Installer for Windows**
3. Execute o instalador
4. Escolha **"Developer Default"** ou **"Server only"**
5. Durante a instalação, defina uma **senha para o usuário root** — guarde essa senha!
6. Finalize a instalação

### Opção B — XAMPP (alternativa simples)

1. Acesse **apachefriends.org** e baixe o XAMPP
2. Instale e abra o **XAMPP Control Panel**
3. Clique em **Start** no MySQL
4. O MySQL roda sem senha por padrão no XAMPP

---

## 4. Configuração do Projeto

### 4.1 — Instalar as dependências do Node.js

Abra o terminal, navegue até a pasta do projeto e execute:

```bash
cd "C:\Users\Pedro.Ghiraldelli\Documents\Code\ghiraldelli-imoveis"
npm install
```

Aguarde o download de todos os pacotes. Quando terminar, vai aparecer uma pasta `node_modules`.

---

### 4.2 — Criar o arquivo de configuração (.env)

Na pasta do projeto, **copie** o arquivo `.env.example` e renomeie para `.env`:

```bash
copy .env.example .env
```

Abra o arquivo `.env` com o Bloco de Notas (ou VSCode) e preencha com seus dados:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=SUA_SENHA_DO_MYSQL_AQUI
DB_NAME=ghiraldelli_imoveis
JWT_SECRET=ghiraldelli_secret_2024_troque_isso
PORT=3000
```

> ⚠️ **Importante:**
> - `DB_PASS` → coloque a senha que você definiu ao instalar o MySQL
> - Se usou XAMPP sem senha, deixe `DB_PASS=` (em branco)
> - `JWT_SECRET` → pode ser qualquer texto longo e aleatório (mais seguro se trocar)

---

### 4.3 — Criar o banco de dados e tabelas

Com o MySQL rodando, execute o script de inicialização:

```bash
node seed.js
```

Se tudo correr bem, você verá:

```
📦  Criando banco "ghiraldelli_imoveis"...
📋  Criando tabelas...
🔑  Configurando admin...
🏠  Inserindo imóveis de exemplo...

✅  Banco de dados inicializado com sucesso!
    Usuário admin: admin
    Senha admin:   ghiraldelli2024
```

> ✅ Isso cria automaticamente:
> - O banco de dados `ghiraldelli_imoveis`
> - As tabelas `imoveis`, `fotos` e `config`
> - 6 imóveis de exemplo para visualização
> - O usuário administrador com senha criptografada

---

## 5. Iniciando o Servidor

```bash
npm start
```

Você verá:

```
🏠  Ghiraldelli Imobiliária rodando em http://localhost:3000
    Admin: http://localhost:3000/admin/login.html
```

> O servidor precisa ficar **aberto no terminal** enquanto o site estiver em uso.
> Para parar o servidor, pressione `Ctrl + C` no terminal.

### Modo desenvolvimento (reinicia automaticamente ao salvar arquivos)

```bash
npm run dev
```

---

## 6. Acesso ao Site e Painel Admin

Com o servidor rodando, abra o navegador:

| Página             | Endereço                                      |
|--------------------|-----------------------------------------------|
| Site principal     | `http://localhost:3000`                       |
| Listagem imóveis   | `http://localhost:3000/imoveis.html`          |
| Painel do admin    | `http://localhost:3000/admin/login.html`      |

---

### 🔑 Credenciais do Administrador

```
Usuário:  admin
Senha:    ghiraldelli2024
```

> ⚠️ **Recomendação de segurança:** Troque a senha imediatamente após o primeiro acesso!
> Acesse **Painel Admin → Configurações → Alterar Senha do Admin**

---

## 7. Como Usar o Painel Admin

### Acessar o painel

1. Abra `http://localhost:3000/admin/login.html`
2. Digite `admin` e a senha `ghiraldelli2024`
3. Clique em **Entrar**

---

### Cadastrar um novo imóvel

1. No painel, clique em **Imóveis** no menu lateral
2. Clique no botão **+ Novo Imóvel** (canto superior direito)
3. Preencha os campos:
   - **Título** *(obrigatório)* — Ex: "Casa 3 quartos em condomínio"
   - **Tipo** — Casa, Apartamento, Terreno ou Comercial
   - **Negócio** — Venda ou Aluguel
   - **Preço** *(obrigatório)* — somente números (Ex: 450000)
   - **Área** — em metros quadrados
   - **Cidade** *(obrigatório)* e **Bairro**
   - **Quartos, Banheiros, Vagas**
   - **Descrição** — texto detalhado do imóvel
   - **Imóvel em Destaque** — marque para aparecer na página inicial
4. **Adicionar fotos:** clique na área de upload ou arraste as imagens
   - Formatos aceitos: JPG, PNG, WEBP
   - Tamanho máximo: 8 MB por foto
   - Máximo de 10 fotos por imóvel
5. Clique em **💾 Salvar Imóvel**

---

### Editar um imóvel

1. Na lista de imóveis, clique no ícone ✏️ na linha do imóvel desejado
2. Altere os campos necessários
3. Para remover fotos existentes, clique no **✕** vermelho sobre a foto
4. Para adicionar novas fotos, use a área de upload
5. Clique em **💾 Atualizar**

---

### Excluir um imóvel

1. Na lista de imóveis, clique no ícone 🗑️
2. Confirme a exclusão na janela que aparecer
3. O imóvel some do site imediatamente (exclusão lógica — permanece no banco)

---

### Destacar um imóvel

- Clique no ícone ⭐ na linha do imóvel
- Imóveis com ⭐ amarelo aparecem na seção "Destaques" da página inicial
- Clique novamente para remover o destaque

---

### Configurar o WhatsApp

1. No menu lateral, clique em **Configurações**
2. No campo **Número**, coloque o número completo com DDI e DDD, **sem espaços ou traços**
   - Exemplo correto: `5511999998888`
   - Padrão: DDI (55 = Brasil) + DDD (11 = SP) + Número
3. Clique em **Salvar WhatsApp**

> Esse número será usado em todos os botões "Falar no WhatsApp" do site.

---

### Alterar a senha do admin

1. No menu lateral, clique em **Configurações**
2. Role até **"Alterar Senha do Admin"**
3. Digite a nova senha (mínimo 6 caracteres)
4. Confirme a nova senha
5. Clique em **Alterar Senha**

> Após alterar, faça logout e entre novamente com a nova senha.

---

## 8. Personalizações Importantes

### Trocar nome/logo da imobiliária

Abra os arquivos HTML e substitua **"Ghiraldelli"** pelo nome desejado:
- `public/index.html`
- `public/imoveis.html`
- `public/imovel.html`
- `public/admin/login.html`
- `public/admin/painel.html`

---

### Trocar endereço e e-mail no rodapé

Abra `public/index.html` e localize o bloco do footer:

```html
<a href="#">📍 São Paulo, SP</a>
<a href="#">📧 contato@ghiraldelli.com.br</a>
```

Substitua pelos dados reais.

---

### Trocar o ano no copyright

No footer de cada HTML:

```html
&copy; 2024 <span>Ghiraldelli Imobiliária</span>
```

Troque `2024` pelo ano atual ou remova para deixar dinâmico.

---

### Mudar as cores do site

Abra `public/css/style.css` e edite as variáveis no início do arquivo:

```css
:root {
  --azul:     #0B2545;   /* Azul escuro (nav, sidebar, textos) */
  --azul-med: #163A6B;   /* Azul médio */
  --ouro:     #C9A84C;   /* Dourado (botões, destaques) */
  --ouro-lt:  #DFC06A;   /* Dourado claro (hover) */
  --branco:   #FFFFFF;
  --off:      #F8F7F2;   /* Fundo off-white */
}
```

---

## 9. Hospedagem em Produção

Para publicar o site na internet, você vai precisar de um servidor com Node.js e MySQL.

### Opções recomendadas

| Serviço         | Tipo        | Obs |
|-----------------|-------------|-----|
| **Railway**     | Cloud simples | Gratuito com limites, fácil de usar |
| **Render**      | Cloud simples | Plano gratuito disponível |
| **DigitalOcean**| VPS         | Mais controle, ~$6/mês |
| **Hostinger**   | VPS         | Opção brasileira, bom custo |

### Passos gerais para publicar

1. Crie uma conta no serviço escolhido
2. Suba o código (sem a pasta `node_modules` e sem o arquivo `.env`)
3. Configure as **variáveis de ambiente** no painel do serviço (os mesmos valores do `.env`)
4. Configure o banco de dados MySQL no serviço
5. Execute `node seed.js` uma vez para inicializar o banco
6. Inicie com `npm start`

### Usar um domínio próprio

1. Compre um domínio (ex: `ghiraldellimoveis.com.br`) no Registro.br ou similar
2. Aponte o domínio para o servidor contratado (DNS A record)
3. Configure SSL/HTTPS (a maioria dos serviços oferece gratuitamente via Let's Encrypt)

---

## 10. Solução de Problemas

### ❌ "Cannot connect to MySQL"

- Verifique se o MySQL está rodando
- Confira se `DB_USER`, `DB_PASS` e `DB_HOST` no `.env` estão corretos
- Tente acessar o MySQL pelo terminal: `mysql -u root -p`

---

### ❌ "node_modules not found" ou erros de módulo

Execute novamente:
```bash
npm install
```

---

### ❌ Site abre mas sem dados / "Erro ao carregar imóveis"

- Certifique-se de que o servidor está rodando (`npm start`)
- Verifique se o seed foi executado (`node seed.js`)
- Abra o site sempre por `http://localhost:3000` — nunca abrindo o arquivo `.html` diretamente

---

### ❌ Login do admin não funciona

- Usuário deve ser exatamente: `admin`
- Senha padrão: `ghiraldelli2024`
- Se já trocou a senha e esqueceu, execute novamente `node seed.js`
  (isso vai redefinir a senha para `ghiraldelli2024` sem apagar os imóveis cadastrados)

---

### ❌ Fotos não aparecem

- Verifique se a pasta `uploads/` existe dentro do projeto (é criada automaticamente)
- Certifique-se de que o arquivo enviado é JPG, PNG ou WEBP e tem menos de 8 MB

---

### ❌ Porta 3000 em uso

Altere a porta no arquivo `.env`:

```env
PORT=3001
```

E acesse `http://localhost:3001`

---

## Estrutura de Arquivos

```
ghiraldelli-imoveis/
│
├── server.js              ← Servidor principal (Express)
├── seed.js                ← Inicializa banco + dados de exemplo
├── package.json           ← Dependências do projeto
├── .env                   ← Suas configurações (não compartilhar!)
├── .env.example           ← Modelo do arquivo de configuração
│
├── config/
│   └── database.js        ← Conexão com MySQL
│
├── middleware/
│   ├── auth.js            ← Verificação de token JWT
│   └── upload.js          ← Upload de fotos (Multer)
│
├── routes/
│   ├── auth.js            ← Login do admin
│   ├── imoveis.js         ← CRUD de imóveis
│   └── config.js          ← WhatsApp e senha
│
├── uploads/               ← Fotos enviadas (criada automaticamente)
│
└── public/                ← Arquivos do site (HTML, CSS, JS)
    ├── index.html         ← Página inicial
    ├── imoveis.html       ← Listagem de imóveis
    ├── imovel.html        ← Detalhe do imóvel
    ├── css/style.css      ← Estilos (paleta azul + dourado)
    ├── js/app.js          ← Funções compartilhadas
    ├── js/admin.js        ← Funções do painel admin
    └── admin/
        ├── login.html     ← Tela de login
        └── painel.html    ← Painel administrativo
```

---

## Resumo Rápido — Do Zero ao Funcionando

```bash
# 1. Entrar na pasta do projeto
cd "C:\Users\Pedro.Ghiraldelli\Documents\Code\ghiraldelli-imoveis"

# 2. Instalar dependências
npm install

# 3. Criar o .env (e editar com suas credenciais MySQL)
copy .env.example .env

# 4. Inicializar banco de dados
node seed.js

# 5. Iniciar o servidor
npm start

# 6. Acessar no navegador
# Site:  http://localhost:3000
# Admin: http://localhost:3000/admin/login.html
#        Usuário: admin | Senha: ghiraldelli2024
```

---

*Desenvolvido para Ghiraldelli Imobiliária*
