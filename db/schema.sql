-- CareerPilot PostgreSQL foundation
-- Run this once against your PostgreSQL database.

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null default '',
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists career_states (
  user_id uuid primary key references users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists mentor_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  role text not null check (role in ('user','mentor')),
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists mentor_messages_user_created_idx
  on mentor_messages(user_id, created_at);
