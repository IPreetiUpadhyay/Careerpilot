-- CareerPilot product schema migration
-- Applied to Neon project lively-rain-69252375, main branch, on 2026-10-03.
-- This migration is additive and idempotent. It does not insert, update, or delete user/authentication data.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS career_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_status text,
  education_level text,
  education_details text,
  years_experience numeric(4,1),
  "current_role" text,
  target_role text,
  work_mode text,
  geography text,
  international_interest boolean NOT NULL DEFAULT false,
  remote_interest boolean NOT NULL DEFAULT false,
  bio text,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS career_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  target_role text,
  target_location text,
  work_mode text,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'paused', 'archived')),
  target_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS career_goals_user_status_idx ON career_goals(user_id, status);

CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_skills (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency text NOT NULL DEFAULT 'beginner'
    CHECK (proficiency IN ('beginner', 'intermediate', 'advanced', 'expert')),
  readiness numeric(5,2) NOT NULL DEFAULT 0
    CHECK (readiness >= 0 AND readiness <= 100),
  verification_status text NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'self_reported', 'assessed', 'practical', 'project', 'work_verified')),
  evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, skill_id)
);

CREATE TABLE IF NOT EXISTS learning_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  provider text,
  url text NOT NULL,
  resource_type text NOT NULL
    CHECK (resource_type IN ('course', 'documentation', 'tutorial', 'practice', 'project', 'video', 'book', 'article', 'certification')),
  difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_free boolean NOT NULL DEFAULT false,
  source_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS career_roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_id uuid REFERENCES career_goals(id) ON DELETE SET NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS roadmap_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id uuid NOT NULL REFERENCES career_roadmaps(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  stage text NOT NULL,
  item_type text NOT NULL
    CHECK (item_type IN ('skill', 'learning', 'practice', 'project', 'assessment', 'portfolio', 'resume', 'application', 'interview')),
  skill_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  resource_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  position integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'locked'
    CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
  completed_at timestamptz
);
CREATE INDEX IF NOT EXISTS roadmap_items_roadmap_position_idx ON roadmap_items(roadmap_id, position);

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  estimated_hours numeric(6,1),
  skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  milestones jsonb NOT NULL DEFAULT '[]'::jsonb,
  evaluation_criteria jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_projects (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'recommended'
    CHECK (status IN ('recommended', 'planned', 'in_progress', 'completed', 'abandoned')),
  progress numeric(5,2) NOT NULL DEFAULT 0
    CHECK (progress >= 0 AND progress <= 100),
  repository_url text,
  live_url text,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, project_id)
);

CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  target_role text,
  content text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS resumes_user_role_idx ON resumes(user_id, target_role);

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text,
  source text,
  company text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
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
  skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  posted_at timestamptz,
  expires_at timestamptz,
  raw_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source, external_id)
);
CREATE INDEX IF NOT EXISTS jobs_title_location_idx ON jobs(title, location);

CREATE TABLE IF NOT EXISTS resume_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id uuid NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  ats_score numeric(5,2),
  role_alignment numeric(5,2),
  keyword_coverage numeric(5,2),
  evidence_score numeric(5,2),
  gaps jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_matches (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  skills_score numeric(5,2),
  experience_score numeric(5,2),
  education_score numeric(5,2),
  location_score numeric(5,2),
  work_mode_score numeric(5,2),
  authorization_score numeric(5,2),
  seniority_score numeric(5,2),
  missing_evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  explanation jsonb NOT NULL DEFAULT '{}'::jsonb,
  computed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, job_id)
);

CREATE TABLE IF NOT EXISTS saved_jobs (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  saved_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, job_id)
);

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  resume_id uuid REFERENCES resumes(id) ON DELETE SET NULL,
  company text NOT NULL,
  role text NOT NULL,
  status text NOT NULL DEFAULT 'saved'
    CHECK (status IN ('saved', 'ready_to_apply', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn')),
  applied_at timestamptz,
  next_follow_up_at timestamptz,
  interview_at timestamptz,
  notes text,
  outcome text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS applications_user_status_idx ON applications(user_id, status);

CREATE TABLE IF NOT EXISTS interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id uuid REFERENCES applications(id) ON DELETE SET NULL,
  interview_type text NOT NULL
    CHECK (interview_type IN ('hr', 'technical', 'behavioral', 'case', 'role_specific', 'mixed')),
  target_role text,
  status text NOT NULL DEFAULT 'started'
    CHECK (status IN ('started', 'completed', 'abandoned')),
  score numeric(5,2),
  evaluation jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS interview_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('interviewer', 'candidate')),
  message text NOT NULL,
  evaluation jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS interview_messages_session_created_idx ON interview_messages(session_id, created_at);

CREATE TABLE IF NOT EXISTS outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id uuid REFERENCES applications(id) ON DELETE SET NULL,
  outcome_type text NOT NULL
    CHECK (outcome_type IN ('application', 'screening', 'interview', 'offer', 'rejection', 'withdrawal', 'hire', 'other')),
  result text,
  feedback text,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS career_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  entity_type text,
  entity_id uuid,
  xp integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS career_events_user_created_idx ON career_events(user_id, created_at);

CREATE TABLE IF NOT EXISTS user_progress (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  level integer NOT NULL DEFAULT 1,
  xp integer NOT NULL DEFAULT 0,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  xp_reward integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_achievements (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS mentor_messages_user_created_idx ON mentor_messages(user_id, created_at);
