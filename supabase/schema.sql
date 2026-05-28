-- ============================================================
-- Notetaker — Schema Supabase
-- Esegui questo script nella Supabase SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---- Notes ------------------------------------------------
create table public.notes (
  id          uuid        default uuid_generate_v4() primary key,
  user_id     uuid        references auth.users(id) on delete cascade not null,
  title       text        not null default 'Nuova nota',
  content     text        not null default '',
  color       text        not null default 'default',
  is_pinned   boolean     not null default false,
  is_favorite boolean     not null default false,
  is_archived boolean     not null default false,
  word_count  integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---- Tags -------------------------------------------------
create table public.tags (
  id         uuid        default uuid_generate_v4() primary key,
  user_id    uuid        references auth.users(id) on delete cascade not null,
  name       text        not null,
  color      text        not null default '#6366f1',
  created_at timestamptz not null default now(),
  unique(user_id, name)
);

-- ---- Note-Tag join ----------------------------------------
create table public.note_tags (
  note_id uuid references public.notes(id) on delete cascade,
  tag_id  uuid references public.tags(id)  on delete cascade,
  primary key (note_id, tag_id)
);

-- ---- Trigger: updated_at ----------------------------------
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger notes_updated_at
  before update on public.notes
  for each row execute function public.update_updated_at();

-- ---- Row Level Security -----------------------------------
alter table public.notes     enable row level security;
alter table public.tags      enable row level security;
alter table public.note_tags enable row level security;

-- Notes: users can only see/edit their own
create policy "notes_select" on public.notes for select using (auth.uid() = user_id);
create policy "notes_insert" on public.notes for insert with check (auth.uid() = user_id);
create policy "notes_update" on public.notes for update using (auth.uid() = user_id);
create policy "notes_delete" on public.notes for delete using (auth.uid() = user_id);

-- Tags: users can only see/edit their own
create policy "tags_select" on public.tags for select using (auth.uid() = user_id);
create policy "tags_insert" on public.tags for insert with check (auth.uid() = user_id);
create policy "tags_update" on public.tags for update using (auth.uid() = user_id);
create policy "tags_delete" on public.tags for delete using (auth.uid() = user_id);

-- Note-tags: via join on notes
create policy "note_tags_select" on public.note_tags for select using (
  exists (select 1 from public.notes where id = note_id and user_id = auth.uid())
);
create policy "note_tags_insert" on public.note_tags for insert with check (
  exists (select 1 from public.notes where id = note_id and user_id = auth.uid())
);
create policy "note_tags_delete" on public.note_tags for delete using (
  exists (select 1 from public.notes where id = note_id and user_id = auth.uid())
);

-- ---- Enable real-time -------------------------------------
alter publication supabase_realtime add table public.notes;
alter publication supabase_realtime add table public.note_tags;
