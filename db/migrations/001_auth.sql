-- Safe migration for an existing CareerPilot database.
alter table users
  add column if not exists password_hash text not null default '';

create index if not exists users_email_idx on users(email);
