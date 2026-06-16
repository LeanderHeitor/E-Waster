# Guia de Deploy — E-Waster (tudo no Render)

Este guia coloca o app **100% no ar** usando uma plataforma só: o **Render**.
São 3 peças, todas criadas de uma vez pelo arquivo `render.yaml`:

| Peça | O que é | Serviço Render |
|------|---------|----------------|
| Frontend | telas React (Vite) | Static Site |
| Backend | API Spring Boot (Java) | Web Service (Docker) |
| Banco | PostgreSQL | PostgreSQL (free) |

> ⚠️ **Lembrete:** o Vercel sozinho **não** roda o backend Java nem o banco. Por isso usamos o Render, que roda os três.

---

## Passo 0 — Subir esta branch para o GitHub

O Render lê o código do GitHub. Esta preparação está na branch `deploy/hospedagem`:

```bash
git push -u origin deploy/hospedagem
```

(Já existe o remote `origin` → github.com/LeanderHeitor/E-Waster)

---

## Passo 1 — Criar conta no Render

1. Acesse https://render.com e clique em **Get Started** / **Sign in with GitHub**.
2. Autorize o Render a acessar o repositório `E-Waster`.

> O plano **Free** é suficiente para demo. Pode pedir cartão para validar, mas não cobra no free.

---

## Passo 2 — Deploy automático com o Blueprint

1. No painel do Render: **New +** → **Blueprint**.
2. Selecione o repositório **E-Waster**.
3. Em **Branch**, escolha **`deploy/hospedagem`**.
4. O Render lê o `render.yaml` e mostra que vai criar: **ewaster-db**, **ewaster-backend** e **ewaster-frontend**.
5. Ele vai pedir o valor da variável **`ADMIN_SENHA`** (senha do administrador do app). Defina uma senha forte e anote.
6. Clique em **Apply** / **Create**.

O Render então: cria o banco → builda o backend (Docker, ~3-5 min na 1ª vez) → builda o frontend → publica tudo.

---

## Passo 3 — Conferir a URL do backend (importante!)

O `render.yaml` assume que o backend vai ficar em:

```
https://ewaster-backend.onrender.com
```

Se esse nome já estiver em uso por outra pessoa, o Render adiciona um sufixo (ex: `ewaster-backend-ab12`). **Confira a URL real** do serviço `ewaster-backend` no painel.

Se a URL for diferente, ajuste a variável do frontend:

1. Abra o serviço **ewaster-frontend** → **Environment**.
2. Edite **`VITE_API_URL`** para: `https://SUA-URL-REAL-DO-BACKEND.onrender.com/api/v1`
3. **Manual Deploy** → **Clear build cache & deploy** (o Vite injeta essa URL no momento do build).

---

## Passo 4 — Testar

1. Abra a URL do **ewaster-frontend** (ex: `https://ewaster-frontend.onrender.com`).
2. Faça login como admin:
   - **email:** `admin@ewaster.com` (ou o `ADMIN_EMAIL` que você definir)
   - **senha:** a que você pôs em `ADMIN_SENHA` no Passo 2
3. Teste cadastro de usuário, ranking, agendamentos, etc.

> Na 1ª vez, o backend cria as tabelas (Flyway V1→V6) e o usuário admin automaticamente.

---

## Variáveis de ambiente (referência)

**Backend** (já configuradas pelo `render.yaml`, exceto onde indicado):

| Variável | Origem | Observação |
|----------|--------|-----------|
| `SPRING_PROFILES_ACTIVE` | `prod` | ativa o perfil de produção |
| `DB_HOST/PORT/NAME/USER/PASSWORD` | do banco | automático |
| `JWT_SECRET` | gerado pelo Render | automático |
| `ADMIN_SENHA` | **você define** | senha do admin |
| `APP_CORS_ALLOWED_ORIGINS` | `https://*.onrender.com` | libera o front |

**Frontend:**

| Variável | Valor |
|----------|-------|
| `VITE_API_URL` | URL do backend + `/api/v1` |

---

## Coisas a saber sobre o plano Free

- **O backend "dorme"** após ~15 min sem uso. A 1ª requisição depois disso leva ~30-50s para acordar. Normal no free.
- **O PostgreSQL free expira em ~30 dias.** Para algo duradouro, faça upgrade do banco ou exporte os dados antes.
- Builds e logs ficam em cada serviço no painel do Render (aba **Logs**).

---

## Alternativa manual (se o Blueprint der erro)

Se o `render.yaml` falhar em alguma parte, dá para criar cada peça pelo painel:

1. **PostgreSQL:** New + → PostgreSQL → free. Anote host/port/db/user/password.
2. **Backend:** New + → Web Service → repo E-Waster, branch `deploy/hospedagem`, **Root Directory** = `backend`, **Runtime** = Docker. Adicione as variáveis da tabela acima (DB_* com os dados do passo 1, `SPRING_PROFILES_ACTIVE=prod`, `JWT_SECRET`=algo longo aleatório, `ADMIN_SENHA`, `APP_CORS_ALLOWED_ORIGINS`).
3. **Frontend:** New + → Static Site → repo E-Waster, **Root Directory** = `frontend`, **Build Command** = `npm ci && npm run build`, **Publish Directory** = `dist`. Variável `VITE_API_URL` = URL do backend + `/api/v1`. Em **Redirects/Rewrites**: Source `/*`, Destination `/index.html`, Action **Rewrite**.

Se aparecer qualquer erro no Render, me cole a mensagem que eu ajusto a configuração.
