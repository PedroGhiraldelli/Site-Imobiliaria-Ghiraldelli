# Guia de Hospedagem — Ghiraldelli Imobiliária

> **Por que a Vercel não funciona?**
> A Vercel suporta apenas sites estáticos e funções serverless (Next.js, React puro, etc.).
> Este projeto usa Express.js rodando continuamente, upload de arquivos com Multer e banco
> de dados MySQL — nenhum desses recursos é compatível com a Vercel.

---

## Opção 1 — Railway (Recomendado)

Railway é a forma mais simples de hospedar esse projeto. Detecta o Node.js automaticamente,
oferece MySQL integrado e tem plano gratuito com $5/mês de crédito.

### Passo a passo

**1. Prepare o código no GitHub**

Crie uma conta em github.com se ainda não tiver. Depois, no terminal do VS Code:

```bash
cd "c:\Users\Pedro.Ghiraldelli\Documents\Code\ghiraldelli-imoveis"
git init
git add .
git commit -m "primeiro commit"
```

Crie um repositório novo em github.com/new (deixe privado se preferir), depois:

```bash
git remote add origin https://github.com/SEU_USUARIO/ghiraldelli-imoveis.git
git push -u origin main
```

> ⚠️ Certifique-se de que o arquivo `.env` está no `.gitignore` para não subir sua senha.
> Crie um `.gitignore` se não existir:
> ```
> .env
> node_modules/
> uploads/
> ```

---

**2. Crie o projeto no Railway**

1. Acesse [railway.app](https://railway.app) e clique em **Login with GitHub**
2. Clique em **New Project**
3. Escolha **Deploy from GitHub repo**
4. Selecione o repositório `ghiraldelli-imoveis`
5. O Railway vai detectar o Node.js e fazer o deploy automaticamente

---

**3. Adicione o banco de dados MySQL**

1. Dentro do projeto no Railway, clique em **+ New**
2. Escolha **Database → Add MySQL**
3. Aguarde o MySQL iniciar (leva 1–2 minutos)
4. Clique no serviço MySQL e vá em **Variables** para ver as credenciais:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`

---

**4. Configure as variáveis de ambiente**

1. Clique no serviço Node.js (seu app)
2. Vá em **Variables → Raw Editor** e cole:

```
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASS=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
JWT_SECRET=ghiraldelli_secret_TROQUE_ISSO_2024
PORT=3000
```

> O Railway conecta automaticamente os serviços usando a notação `${{MySQL.VARIAVEL}}`.

---

**5. Inicialize o banco de dados**

Após o deploy, execute o seed pelo terminal do Railway:

1. Clique no serviço do app → aba **Deploy**
2. Clique em **Railway CLI** ou use o painel web:
   - Aba **Settings → Start Command**: altere temporariamente para `node seed.js`
   - Aguarde rodar, depois volte para `node server.js`

Alternativa mais simples: abra o terminal do Railway no serviço e rode:
```bash
node seed.js
```

---

**6. Acesse o site**

1. Clique no serviço do app → aba **Settings → Domains**
2. Clique em **Generate Domain**
3. Seu site estará em algo como: `https://ghiraldelli-imoveis.up.railway.app`

---

## Opção 2 — Render

Similar ao Railway, com plano gratuito (o servidor "dorme" após 15 min de inatividade no plano free).

**1. Banco de dados**
1. Acesse [render.com](https://render.com) → **New → MySQL** (ou use PlanetScale/ClearDB)
2. Crie o banco e anote: host, usuário, senha, nome do banco

**2. Web Service**
1. **New → Web Service**
2. Conecte ao repositório GitHub
3. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Em **Environment Variables**, adicione as mesmas variáveis do `.env`

**3. Seed**
No painel do Render, aba **Shell**, execute:
```bash
node seed.js
```

---

## Opção 3 — ngrok (Teste rápido, sem hospedagem)

Útil para demonstrar o site para alguém enquanto seu computador está ligado.
**Não é hospedagem permanente.**

**1. Instale o ngrok**
```bash
npm install -g ngrok
```

Ou baixe em [ngrok.com/download](https://ngrok.com/download).

**2. Inicie o servidor normalmente**
```bash
npm start
```

**3. Em outro terminal, exponha a porta 3000**
```bash
ngrok http 3000
```

Você verá um link como:
```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:3000
```

Compartilhe esse link. Ele funciona enquanto o terminal do ngrok estiver aberto.

> Para um link fixo (não muda a cada vez), crie uma conta gratuita em ngrok.com e use:
> ```bash
> ngrok config add-authtoken SEU_TOKEN
> ngrok http --domain=meusite.ngrok-free.app 3000
> ```

---

## Comparativo rápido

| | Railway | Render | ngrok |
|---|---|---|---|
| **Custo** | $5/mês de crédito grátis | Gratuito (com limitações) | Gratuito |
| **MySQL incluído** | ✅ Sim | ✅ Sim (pago) / externo | ❌ Usa o local |
| **Sempre online** | ✅ Sim | ⚠️ Dorme no free | ❌ Só com PC ligado |
| **Upload de fotos** | ✅ Sim | ✅ Sim | ✅ Sim |
| **Facilidade** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Indicado para** | Produção | Produção | Demonstrações |

---

## Variáveis de ambiente necessárias

Em qualquer plataforma, configure estas variáveis:

| Variável | Descrição | Exemplo |
|---|---|---|
| `DB_HOST` | Endereço do servidor MySQL | `mysql.railway.internal` |
| `DB_PORT` | Porta do MySQL | `3306` |
| `DB_USER` | Usuário do banco | `root` |
| `DB_PASS` | Senha do banco | `sua_senha` |
| `DB_NAME` | Nome do banco | `ghiraldelli_imoveis` |
| `JWT_SECRET` | Chave secreta para o login admin | qualquer string longa e aleatória |
| `PORT` | Porta do servidor (Railway define automaticamente) | `3000` |

> 💡 **Dica de segurança:** Nunca suba o arquivo `.env` para o GitHub.
> Use sempre as variáveis de ambiente do painel da plataforma.
