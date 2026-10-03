-- CareerPilot PostgreSQL application schema
-- Core relational data lives here. Empty tables are intentional: production data is created by user actions and real integrations.

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null default '',
  password_hash text not null default '',
  phone text,
  preferences jsonb not null default '{}'::jsonb,
  pending_email text,
  email_verification_token_hash text,
  email_verification_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_email_idx
  on users(email);

create table if not exists career_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  current_status text,
  education_level text,
  education_details text,
  years_experience numeric(4,1),
  "current_role" text,
  target_role text,
  work_mode text,
  geography text,
  international_interest boolean not null default false,
  remote_interest boolean not null default false,
  bio text,
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists career_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  target_role text,
  target_location text,
  work_mode text,
  status text not null default 'active'
    check (status in ('active','completed','paused','archived')),
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists career_goals_user_status_idx
  on career_goals(user_id, status);

create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  category text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists user_skills (
  user_id uuid not null references users(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  proficiency text not null default 'beginner'
    check (proficiency in ('beginner','intermediate','advanced','expert')),
  readiness numeric(5,2) not null default 0
    check (readiness >= 0 and readiness <= 100),
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified','self_reported','assessed','practical','project','work_verified')),
  evidence jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, skill_id)
);

create table if not exists learning_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  provider text,
  url text not null,
  resource_type text not null
    check (resource_type in ('course','documentation','tutorial','practice','project','video','book','article','certification')),
  difficulty text
    check (difficulty in ('beginner','intermediate','advanced')),
  skills jsonb not null default '[]'::jsonb,
  is_free boolean not null default false,
  source_verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists career_roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  goal_id uuid references career_goals(id) on delete set null,
  title text not null,
  status text not null default 'active'
    check (status in ('draft','active','completed','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists roadmap_items (
  id uuid primary key default gen_random_uuid(),
  roadmap_id uuid not null references career_roadmaps(id) on delete cascade,
  title text not null,
  description text,
  stage text not null,
  item_type text not null
    check (item_type in ('skill','learning','practice','project','assessment','portfolio','resume','application','interview')),
  skill_ids jsonb not null default '[]'::jsonb,
  resource_ids jsonb not null default '[]'::jsonb,
  position integer not null default 0,
  status text not null default 'locked'
    check (status in ('locked','available','in_progress','completed')),
  completed_at timestamptz
);

create index if not exists roadmap_items_roadmap_position_idx
  on roadmap_items(roadmap_id, position);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  difficulty text
    check (difficulty in ('beginner','intermediate','advanced','expert')),
  estimated_hours numeric(6,1),
  skills jsonb not null default '[]'::jsonb,
  requirements jsonb not null default '[]'::jsonb,
  milestones jsonb not null default '[]'::jsonb,
  evaluation_criteria jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists user_projects (
  user_id uuid not null references users(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  status text not null default 'recommended'
    check (status in ('recommended','planned','in_progress','completed','abandoned')),
  progress numeric(5,2) not null default 0
    check (progress >= 0 and progress <= 100),
  repository_url text,
  live_url text,
  evidence jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, project_id)
);

create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  target_role text,
  content text not null,
  version integer not null default 1,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resumes_user_role_idx
  on resumes(user_id, target_role);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  external_id text,
  source text,
  company text not null,
  title text not null,
  description text not null,
  url text,
  location text,
  country text,
  work_mode text,
  employment_type text,
  seniority text,
  education_requirement text,
  experience_requirement text,
  salary_min numeric(14,2),
  salary_max numeric(14,2),
  salary_currency text,
  visa_sponsorship boolean,
  work_authorization text,
  timezone_requirement text,
  skills jsonb not null default '[]'::jsonb,
  requirements jsonb not null default '[]'::jsonb,
  posted_at timestamptz,
  expires_at timestamptz,
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source, external_id)
);

create index if not exists jobs_title_location_idx
  on jobs(title, location);

create table if not exists resume_analyses (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references resumes(id) on delete cascade,
  job_id uuid references jobs(id) on delete set null,
  ats_score numeric(5,2),
  role_alignment numeric(5,2),
  keyword_coverage numeric(5,2),
  evidence_score numeric(5,2),
  gaps jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists job_matches (
  user_id uuid not null references users(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  skills_score numeric(5,2),
  experience_score numeric(5,2),
  education_score numeric(5,2),
  location_score numeric(5,2),
  work_mode_score numeric(5,2),
  authorization_score numeric(5,2),
  seniority_score numeric(5,2),
  missing_evidence jsonb not null default '[]'::jsonb,
  explanation jsonb not null default '{}'::jsonb,
  computed_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

create table if not exists saved_jobs (
  user_id uuid not null references users(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  job_id uuid references jobs(id) on delete set null,
  resume_id uuid references resumes(id) on delete set null,
  company text not null,
  role text not null,
  status text not null default 'saved'
    check (status in ('saved','ready_to_apply','applied','screening','interview','offer','rejected','withdrawn')),
  applied_at timestamptz,
  next_follow_up_at timestamptz,
  interview_at timestamptz,
  notes text,
  outcome text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_user_status_idx
  on applications(user_id, status);

create table if not exists interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  application_id uuid references applications(id) on delete set null,
  interview_type text not null
    check (interview_type in ('hr','technical','behavioral','case','role_specific','mixed')),
  target_role text,
  status text not null default 'started'
    check (status in ('started','completed','abandoned')),
  score numeric(5,2),
  evaluation jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists interview_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references interview_sessions(id) on delete cascade,
  role text not null check (role in ('interviewer','candidate')),
  message text not null,
  evaluation jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists interview_messages_session_created_idx
  on interview_messages(session_id, created_at);

create table if not exists outcomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  application_id uuid references applications(id) on delete set null,
  outcome_type text not null
    check (outcome_type in ('application','screening','interview','offer','rejection','withdrawal','hire','other')),
  result text,
  feedback text,
  recorded_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists career_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  xp integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists career_events_user_created_idx
  on career_events(user_id, created_at);

create table if not exists user_progress (
  user_id uuid primary key references users(id) on delete cascade,
  level integer not null default 1,
  xp integer not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text not null,
  xp_reward integer not null default 0
);

create table if not exists user_achievements (
  user_id uuid not null references users(id) on delete cascade,
  achievement_id uuid not null references achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
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

create table if not exists career_states (
  user_id uuid primary key references users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);


create table if not exists user_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  project_key text not null,
  title text not null,
  description text not null default '',
  status text not null default 'in-progress' check (status in ('in-progress','completed')),
  milestones jsonb not null default '[]'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, project_key)
);