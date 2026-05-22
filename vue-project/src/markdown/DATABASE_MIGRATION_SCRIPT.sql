-- 数据库迁移脚本 - 用于创建所有必要的表结构

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 学习目标表
CREATE TABLE IF NOT EXISTS learning_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    goal_text TEXT NOT NULL,
    target_date TIMESTAMP,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_learning_goals_user_id ON learning_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_goals_completed ON learning_goals(completed);

-- 2. 学习统计表
CREATE TABLE IF NOT EXISTS learning_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    total_study_time INTEGER DEFAULT 0,
    completed_lessons INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_study_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_learning_stats_user_id ON learning_stats(user_id);

-- 3. 学习记录表
CREATE TABLE IF NOT EXISTS study_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(255),
    chapter_id VARCHAR(255),
    study_time INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_study_records_user_id ON study_records(user_id);
CREATE INDEX IF NOT EXISTS idx_study_records_course_id ON study_records(course_id);
CREATE INDEX IF NOT EXISTS idx_study_records_created_at ON study_records(created_at);

-- 4. 用户笔记表
CREATE TABLE IF NOT EXISTS user_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    chapter_id VARCHAR(255),
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_chapter_id ON user_notes(chapter_id);

-- 5. 对话历史表
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    messages JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

-- 6. 社区点赞表
CREATE TABLE IF NOT EXISTS community_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_community_likes_user_id ON community_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_post_id ON community_likes(post_id);

-- 7. 社区书签表
CREATE TABLE IF NOT EXISTS community_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_community_bookmarks_user_id ON community_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_community_bookmarks_post_id ON community_bookmarks(post_id);

-- 8. 社区关注表
CREATE TABLE IF NOT EXISTS community_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    followed_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, followed_user_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_community_follows_user_id ON community_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_community_follows_followed_user_id ON community_follows(followed_user_id);

-- 9. 社区草稿表
CREATE TABLE IF NOT EXISTS community_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_community_drafts_user_id ON community_drafts(user_id);

-- 10. 修炼数据表
CREATE TABLE IF NOT EXISTS cultivation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    exp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_cultivation_user_id ON cultivation(user_id);

-- 11. 学习进度表（如果不存在）
CREATE TABLE IF NOT EXISTS learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(255) NOT NULL,
    chapter_id VARCHAR(255) NOT NULL,
    progress_percentage INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id, chapter_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_course_id ON learning_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_completed ON learning_progress(completed);

-- 创建存储过程 - 用于在数据迁移服务中创建表

-- 创建学习目标表的存储过程
CREATE OR REPLACE FUNCTION create_learning_goals_table() RETURNS void AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'learning_goals') THEN
        CREATE TABLE learning_goals (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            goal_text TEXT NOT NULL,
            target_date TIMESTAMP,
            completed BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX idx_learning_goals_user_id ON learning_goals(user_id);
        CREATE INDEX idx_learning_goals_completed ON learning_goals(completed);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建学习统计表的存储过程
CREATE OR REPLACE FUNCTION create_learning_stats_table() RETURNS void AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'learning_stats') THEN
        CREATE TABLE learning_stats (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
            total_study_time INTEGER DEFAULT 0,
            completed_lessons INTEGER DEFAULT 0,
            streak_days INTEGER DEFAULT 0,
            last_study_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX idx_learning_stats_user_id ON learning_stats(user_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建学习记录表的存储过程
CREATE OR REPLACE FUNCTION create_study_records_table() RETURNS void AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'study_records') THEN
        CREATE TABLE study_records (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            course_id VARCHAR(255),
            chapter_id VARCHAR(255),
            study_time INTEGER DEFAULT 0,
            completed BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX idx_study_records_user_id ON study_records(user_id);
        CREATE INDEX idx_study_records_course_id ON study_records(course_id);
        CREATE INDEX idx_study_records_created_at ON study_records(created_at);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建用户笔记表的存储过程
CREATE OR REPLACE FUNCTION create_user_notes_table() RETURNS void AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_notes') THEN
        CREATE TABLE user_notes (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            chapter_id VARCHAR(255),
            tags JSONB DEFAULT '[]',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX idx_user_notes_user_id ON user_notes(user_id);
        CREATE INDEX idx_user_notes_chapter_id ON user_notes(chapter_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建对话历史表的存储过程
CREATE OR REPLACE FUNCTION create_conversations_table() RETURNS void AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'conversations') THEN
        CREATE TABLE conversations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            messages JSONB NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX idx_conversations_user_id ON conversations(user_id);
        CREATE INDEX idx_conversations_created_at ON conversations(created_at);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建社区点赞表的存储过程
CREATE OR REPLACE FUNCTION create_community_likes_table() RETURNS void AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'community_likes') THEN
        CREATE TABLE community_likes (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            post_id VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, post_id)
        );
        CREATE INDEX idx_community_likes_user_id ON community_likes(user_id);
        CREATE INDEX idx_community_likes_post_id ON community_likes(post_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建社区书签表的存储过程
CREATE OR REPLACE FUNCTION create_community_bookmarks_table() RETURNS void AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'community_bookmarks') THEN
        CREATE TABLE community_bookmarks (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            post_id VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, post_id)
        );
        CREATE INDEX idx_community_bookmarks_user_id ON community_bookmarks(user_id);
        CREATE INDEX idx_community_bookmarks_post_id ON community_bookmarks(post_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建社区关注表的存储过程
CREATE OR REPLACE FUNCTION create_community_follows_table() RETURNS void AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'community_follows') THEN
        CREATE TABLE community_follows (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            followed_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, followed_user_id)
        );
        CREATE INDEX idx_community_follows_user_id ON community_follows(user_id);
        CREATE INDEX idx_community_follows_followed_user_id ON community_follows(followed_user_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建社区草稿表的存储过程
CREATE OR REPLACE FUNCTION create_community_drafts_table() RETURNS void AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'community_drafts') THEN
        CREATE TABLE community_drafts (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255),
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX idx_community_drafts_user_id ON community_drafts(user_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建修炼数据表的存储过程
CREATE OR REPLACE FUNCTION create_cultivation_table() RETURNS void AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'cultivation') THEN
        CREATE TABLE cultivation (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
            exp INTEGER DEFAULT 0,
            level INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX idx_cultivation_user_id ON cultivation(user_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 执行所有创建表的存储过程
SELECT create_learning_goals_table();
SELECT create_learning_stats_table();
SELECT create_study_records_table();
SELECT create_user_notes_table();
SELECT create_conversations_table();
SELECT create_community_likes_table();
SELECT create_community_bookmarks_table();
SELECT create_community_follows_table();
SELECT create_community_drafts_table();
SELECT create_cultivation_table();

-- 清理存储过程（可选）
-- DROP FUNCTION IF EXISTS create_learning_goals_table();
-- DROP FUNCTION IF EXISTS create_learning_stats_table();
-- DROP FUNCTION IF EXISTS create_study_records_table();
-- DROP FUNCTION IF EXISTS create_user_notes_table();
-- DROP FUNCTION IF EXISTS create_conversations_table();
-- DROP FUNCTION IF EXISTS create_community_likes_table();
-- DROP FUNCTION IF EXISTS create_community_bookmarks_table();
-- DROP FUNCTION IF EXISTS create_community_follows_table();
-- DROP FUNCTION IF EXISTS create_community_drafts_table();
-- DROP FUNCTION IF EXISTS create_cultivation_table();

-- 完成
COMMIT;