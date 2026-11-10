-- Password reset tokens are stored only as SHA-256 hashes and expire after 30 minutes.
alter table users
  add column if not exists password_reset_token_hash text,
  add column if not exists password_reset_expires_at timestamptz;

create unique index if not exists users_password_reset_token_hash_idx
  on users(password_reset_token_hash)
  where password_reset_token_hash is not null;
