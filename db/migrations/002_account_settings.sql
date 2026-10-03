-- Account profile and preference fields
alter table users add column if not exists phone text;
alter table users add column if not exists preferences jsonb not null default '{}'::jsonb;

create unique index if not exists users_phone_unique_idx
  on users(phone)
  where phone is not null and phone <> '';
