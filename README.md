# Notetaker

App per prendere note con supporto markdown, tag, ricerca full-text e sincronizzazione in tempo reale.

## Funzionalità

- **Editor Markdown** con anteprima live (split / preview)
- **Tag & categorie** con colori personalizzati
- **Ricerca full-text** in tempo reale su titolo e contenuto
- **Pin / Preferiti / Archivio** per organizzare le note
- **Colori personalizzati** per ogni nota (8 colori pastello)
- **Dark / Light mode** con rilevamento automatico sistema
- **Auto-save** con debounce da 1.5s e indicatore di stato
- **Contatore parole e caratteri** in tempo reale
- **Export** note in `.md` o `.txt`
- **Scorciatoie da tastiera** (`Ctrl+N`, `Ctrl+F`, `Ctrl+/`)
- **Real-time sync** tramite Supabase Realtime
- **Authentication** email/password e magic link

## Stack tecnologico

- **Next.js 15** — App Router
- **Supabase** — Database PostgreSQL + Auth + Realtime
- **Tailwind CSS** — Styling
- **Zustand** — State management
- **@uiw/react-md-editor** — Editor markdown
- **next-themes** — Dark mode

## Configurazione

### 1. Clona il repository

```bash
git clone https://github.com/TUO-USERNAME/notetaker.git
cd notetaker
npm install
```

### 2. Configura Supabase

1. Crea un progetto su [supabase.com](https://supabase.com)
2. Vai su **SQL Editor** e incolla il contenuto di `supabase/schema.sql`
3. Copia le chiavi API da **Project Settings → API**

### 3. Variabili d'ambiente

```bash
cp .env.local.example .env.local
# Apri .env.local e compila con i tuoi valori Supabase
```

### 4. Configura i redirect URL in Supabase

In **Authentication → URL Configuration**:
- Site URL: `http://localhost:3000` (dev) / `https://tuo-sito.vercel.app` (prod)
- Redirect URLs: aggiungi `http://localhost:3000/api/auth/callback`

### 5. Avvia in sviluppo

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000)

## Deploy su Vercel

1. Fai push su GitHub
2. Importa il progetto su [vercel.com](https://vercel.com)
3. Aggiungi le variabili d'ambiente nella dashboard Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (URL del tuo sito Vercel)
4. Aggiungi l'URL Vercel ai **Redirect URLs** in Supabase Auth

## Scorciatoie da tastiera

| Scorciatoia | Azione |
|-------------|--------|
| `Ctrl+N` | Nuova nota |
| `Ctrl+F` | Focus sulla ricerca |
| `Ctrl+/` | Mostra scorciatoie |
| `Ctrl+S` | Salva nota |

## Struttura progetto

```
app/
  (auth)/login        # Pagina login
  (auth)/signup       # Pagina registrazione
  (dashboard)/        # Dashboard principale
  api/auth/           # Route handlers OAuth
components/
  auth/               # Form autenticazione
  layout/             # Sidebar, Provider, Modal
  notes/              # NoteCard, NoteEditor, ColorPicker
  tags/               # TagManager
lib/
  supabase/           # Client browser, server, middleware
  store/              # Zustand store globale
  hooks/              # Auto-save, keyboard shortcuts
supabase/
  schema.sql          # Schema DB completo
```

## Licenza

MIT
