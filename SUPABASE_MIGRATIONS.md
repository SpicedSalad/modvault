# Supabase Schema Updates Guide

This document provides the SQL migrations needed to support all the new features implemented in ModVault.

## 1. Update Tweaks Table - Add New Columns

```sql
-- Add minecraft_version column (optional field for mod compatibility info)
ALTER TABLE tweaks
ADD COLUMN minecraft_version TEXT;

-- Add loader_type column (enum: Forge, Fabric, Quilt, NeoForge)
ALTER TABLE tweaks
ADD COLUMN loader_type TEXT;

-- Update tags column to support structured data (if not already JSON)
-- The tags column should be able to store JSON array with structure: [{name: string, customDescription?: string}, ...]
-- If tags is currently TEXT, you can keep it or change to JSONB for better performance:
-- ALTER TABLE tweaks ALTER COLUMN tags TYPE JSONB USING tags::jsonb;
```

## 2. Enable CASCADE DELETE on Comments Table

This ensures that when a parent comment is deleted, all child replies are automatically deleted.

```sql
-- First, drop the existing foreign key if it exists
ALTER TABLE comments
DROP CONSTRAINT IF EXISTS comments_parent_id_fkey;

-- Add the foreign key with ON DELETE CASCADE
ALTER TABLE comments
ADD CONSTRAINT comments_parent_id_fkey
FOREIGN KEY (parent_id)
REFERENCES comments(id)
ON DELETE CASCADE;
```

## 3. Ensure Comments Table Has parent_id Column

The comments table should have a `parent_id` column to support nested replies:

```sql
-- Add parent_id column if it doesn't exist
ALTER TABLE comments
ADD COLUMN parent_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- Create an index on parent_id for better query performance
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
```

## 4. Update RLS (Row Level Security) Policies

Ensure that users can only delete their own comments:

```sql
-- Policy: Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
ON comments
FOR DELETE
USING (auth.uid() = user_id);

-- Policy: Users can view all comments
CREATE POLICY "Comments are viewable by everyone"
ON comments
FOR SELECT
USING (TRUE);

-- Policy: Authenticated users can insert comments
CREATE POLICY "Authenticated users can insert comments"
ON comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own comments
CREATE POLICY "Users can update their own comments"
ON comments
FOR UPDATE
USING (auth.uid() = user_id);
```

## 5. Ensure Profiles Table Has Required Columns

The profiles table should have username and avatar_url:

```sql
-- Add columns if they don't exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

## 6. Verify Vote and Votes Table Structure

The votes table should have the correct structure for the voting system:

```sql
-- Ensure votes table has correct columns
-- If it doesn't exist, create it:
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tweak_id UUID NOT NULL REFERENCES tweaks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_value INT NOT NULL CHECK (vote_value IN (-1, 1)),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tweak_id, user_id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_votes_tweak_id ON votes(tweak_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
```

## 7. Create AI Insights Table (if not exists)

For the AI insights feature:

```sql
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tweak_id UUID NOT NULL UNIQUE REFERENCES tweaks(id) ON DELETE CASCADE,
  insight_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_tweak_id ON ai_insights(tweak_id);
```

## 8. Update Images Table (if needed)

Ensure the images table has proper cascade delete:

```sql
-- Update foreign key to use CASCADE delete
ALTER TABLE images
DROP CONSTRAINT IF EXISTS images_tweak_id_fkey;

ALTER TABLE images
ADD CONSTRAINT images_tweak_id_fkey
FOREIGN KEY (tweak_id)
REFERENCES tweaks(id)
ON DELETE CASCADE;
```

## 9. Test the Schema Changes

After applying these migrations, you can test the cascade delete functionality:

```sql
-- Test cascade delete: Delete a parent comment and verify child replies are deleted
-- First, create test data:
INSERT INTO comments (tweak_id, user_id, content, parent_id) 
VALUES (your_tweak_id, your_user_id, 'Parent comment', NULL)
RETURNING id;

-- Create a child reply using the parent ID above
INSERT INTO comments (tweak_id, user_id, content, parent_id)
VALUES (your_tweak_id, your_user_id, 'Child reply', parent_id_from_above)
RETURNING id;

-- Now delete the parent comment
DELETE FROM comments WHERE id = parent_id_from_above;

-- Verify that the child reply was also deleted
SELECT * FROM comments WHERE parent_id = parent_id_from_above;
-- Should return 0 rows
```

## 10. Important Notes

- **Backup Your Database**: Always backup your Supabase database before running migrations
- **Test in Development**: Test these migrations in a development environment first
- **CASCADE DELETE**: The CASCADE DELETE on comments.parent_id ensures that when a parent comment is deleted, all nested replies are automatically removed
- **RLS Policies**: Make sure RLS policies allow only the comment author to delete comments
- **Tags JSON Structure**: The tags column now supports custom descriptions alongside tag names, making it JSONB is recommended for better performance

## Migration Script Example

You can run these migrations in the Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Paste the migration SQL statements above
5. Click "Run"

For production environments, consider using Supabase Migrations or a migration tool to manage these changes safely.
