-- G0GA Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor

-- ── Leads (contact form + call bookings + chat) ──
create table if not exists leads (
  id          uuid default gen_random_uuid() primary key,
  created_at  timestamptz default now(),
  name        text not null,
  email       text not null,
  company     text,
  service     text,
  budget      text,
  message     text,
  source      text default 'contact_form', -- 'contact_form' | 'call_booking' | 'chat'
  status      text default 'new'           -- 'new' | 'contacted' | 'call_scheduled' | 'converted' | 'closed'
);

-- ── Projects (client projects) ──
create table if not exists projects (
  id           uuid default gen_random_uuid() primary key,
  created_at   timestamptz default now(),
  lead_id      uuid references leads(id),
  client_name  text not null,
  client_email text,
  title        text not null,
  description  text,
  service      text,
  budget_total numeric,
  paid_amount  numeric default 0,
  status       text default 'inquiry',     -- 'inquiry' | 'in_progress' | 'review' | 'delivered' | 'closed'
  assigned_to  text,                        -- agent name: 'Orion', 'Cypher', etc.
  deadline     date,
  notes        text
);

-- ── Agent Logs (what each agent did) ──
create table if not exists agent_logs (
  id         uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  agent      text not null,               -- 'Nova', 'Kai', 'Zion', 'Zara', 'Alex'
  action     text not null,               -- 'posted_linkedin', 'seo_report', 'content_created', etc.
  details    text,
  project_id uuid references projects(id)
);

-- ── Portfolio (case studies shown on website) ──
create table if not exists portfolio (
  id           uuid default gen_random_uuid() primary key,
  created_at   timestamptz default now(),
  title        text not null,
  client       text default '',
  location     text default '',
  type         text default 'AI Integration',
  description  text default '',
  result1_val  text default '',
  result1_lbl  text default '',
  result2_val  text default '',
  result2_lbl  text default '',
  result3_val  text default '',
  result3_lbl  text default '',
  tech         text default '',
  accent_color text default '#10b981',
  is_active    boolean default true
);

-- ── Enable Row Level Security ──
alter table leads       enable row level security;
alter table projects    enable row level security;
alter table agent_logs  enable row level security;
alter table portfolio   enable row level security;

-- Allow server-side (service role) full access — no policy needed for service role
-- Public anon cannot read/write (secure by default)
