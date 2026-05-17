CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student',
    class_level VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT '📚',
    color VARCHAR(20) DEFAULT '#3b82f6',
    class_level VARCHAR(50),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chapters (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    video_url TEXT,
    duration_minutes INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    is_preview BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mcqs (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option CHAR(1) NOT NULL,
    explanation TEXT,
    difficulty VARCHAR(20) DEFAULT 'medium',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enrollments (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, subject_id)
);

CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    UNIQUE (user_id, chapter_id)
);

CREATE TABLE IF NOT EXISTS mcq_bookmarks (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    mcq_id INTEGER REFERENCES mcqs(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, mcq_id)
);

CREATE TABLE IF NOT EXISTS mcq_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    chapter_id INTEGER REFERENCES chapters(id) ON DELETE SET NULL,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE SET NULL,
    mode VARCHAR(20) NOT NULL,
    total_questions INTEGER NOT NULL,
    answered INTEGER DEFAULT 0,
    correct INTEGER DEFAULT 0,
    wrong INTEGER DEFAULT 0,
    score_percent NUMERIC(5,2),
    time_limit_seconds INTEGER,
    time_taken_seconds INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mcq_session_answers (
    session_id INTEGER REFERENCES mcq_sessions(id) ON DELETE CASCADE,
    mcq_id INTEGER REFERENCES mcqs(id) ON DELETE CASCADE,
    selected_option CHAR(1),
    is_correct BOOLEAN,
    time_taken_seconds INTEGER DEFAULT 0,
    PRIMARY KEY (session_id, mcq_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    target VARCHAR(50) DEFAULT 'all',
    target_value VARCHAR(255),
    is_important BOOLEAN DEFAULT FALSE,
    scheduled_at TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_notifications (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    notification_id INTEGER REFERENCES notifications(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    PRIMARY KEY (user_id, notification_id)
);

CREATE TABLE IF NOT EXISTS exams (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE SET NULL,
    chapter_id INTEGER REFERENCES chapters(id) ON DELETE SET NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    total_marks INTEGER NOT NULL DEFAULT 100,
    passing_marks INTEGER DEFAULT 40,
    question_count INTEGER NOT NULL DEFAULT 10,
    difficulty VARCHAR(20) DEFAULT 'mixed',
    is_published BOOLEAN DEFAULT FALSE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mcq_import_history (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id),
    filename VARCHAR(255),
    source_type VARCHAR(50),
    total_parsed INTEGER,
    total_imported INTEGER,
    errors JSONB,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS class_levels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(10) DEFAULT '🎓',
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS class_subjects (
  id SERIAL PRIMARY KEY,
  level_id INTEGER REFERENCES class_levels(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(10) DEFAULT '📚',
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS class_chapters (
  id SERIAL PRIMARY KEY,
  subject_id INTEGER REFERENCES class_subjects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  youtube_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS class_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  classes_visible BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO class_settings (id, classes_visible) VALUES (1, true)
  ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS flashcard_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  flashcards_visible BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flashcard_levels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(10) DEFAULT '🃏',
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flashcard_subjects (
  id SERIAL PRIMARY KEY,
  level_id INTEGER REFERENCES flashcard_levels(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(10) DEFAULT '📚',
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flashcard_chapters (
  id SERIAL PRIMARY KEY,
  subject_id INTEGER REFERENCES flashcard_subjects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flashcards (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER REFERENCES flashcard_chapters(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO flashcard_settings (id, flashcards_visible) VALUES (1, true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO flashcard_levels (name, description, icon, order_index)
VALUES
  ('Certificate',  'Foundation level flash cards', '📜', 1),
  ('Professional', 'Intermediate level flash cards', '💼', 2),
  ('Advanced',     'Advanced level flash cards', '🏆', 3)
ON CONFLICT (name) DO NOTHING;

INSERT INTO class_levels (name, description, icon, order_index, is_visible)
VALUES
  ('Certificate',   'Foundation level certification courses',         '📜', 1, true),
  ('Professional',  'Intermediate professional certification courses', '💼', 2, true),
  ('Advanced',      'Advanced level mastery courses',                 '🏆', 3, true)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS shortnote_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  shortnotes_visible BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shortnote_levels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(10) DEFAULT '📝',
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shortnote_subjects (
  id SERIAL PRIMARY KEY,
  level_id INTEGER REFERENCES shortnote_levels(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(10) DEFAULT '📚',
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shortnote_chapters (
  id SERIAL PRIMARY KEY,
  subject_id INTEGER REFERENCES shortnote_subjects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shortnote_files (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER REFERENCES shortnote_chapters(id) ON DELETE CASCADE UNIQUE,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO shortnote_settings (id, shortnotes_visible) VALUES (1, true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO shortnote_levels (name, description, icon, order_index)
VALUES
  ('Certificate',  'Foundation level short notes', '📜', 1),
  ('Professional', 'Intermediate level short notes', '💼', 2),
  ('Advanced',     'Advanced level short notes', '🏆', 3)
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS short_notes (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER REFERENCES shortnote_chapters(id) ON DELETE CASCADE UNIQUE,
  type VARCHAR(10) DEFAULT 'pdf' CHECK (type IN ('pdf','text')),
  text_content TEXT,
  filename VARCHAR(255),
  original_name VARCHAR(255),
  file_size INTEGER,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* ── Question Bank ── */
CREATE TABLE IF NOT EXISTS qbank_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  qbank_visible BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS qbank_levels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  icon VARCHAR(10) DEFAULT '📝',
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS qbank_subjects (
  id SERIAL PRIMARY KEY,
  level_id INTEGER REFERENCES qbank_levels(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  description TEXT DEFAULT '',
  icon VARCHAR(10) DEFAULT '📚',
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS qbank_chapters (
  id SERIAL PRIMARY KEY,
  subject_id INTEGER REFERENCES qbank_subjects(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT '',
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS qbank_contents (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER REFERENCES qbank_chapters(id) ON DELETE CASCADE,
  content_type VARCHAR(10) CHECK (content_type IN ('mcq','pdf','text')),
  is_visible BOOLEAN DEFAULT TRUE,
  filename VARCHAR(255),
  original_name VARCHAR(255),
  file_size INTEGER,
  text_content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(chapter_id, content_type)
);

CREATE TABLE IF NOT EXISTS qbank_mcqs (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER REFERENCES qbank_chapters(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL DEFAULT '',
  option_b TEXT NOT NULL DEFAULT '',
  option_c TEXT NOT NULL DEFAULT '',
  option_d TEXT NOT NULL DEFAULT '',
  correct_option CHAR(1) DEFAULT 'a' CHECK (correct_option IN ('a','b','c','d')),
  explanation TEXT DEFAULT '',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO qbank_settings (id, qbank_visible) VALUES (1, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO qbank_levels (name, description, icon, order_index) VALUES
  ('Certificate',  'Foundation level question bank', '📜', 1),
  ('Professional', 'Intermediate level question bank', '💼', 2),
  ('Advanced',     'Advanced level question bank', '🏆', 3)
ON CONFLICT (name) DO NOTHING;
