-- Add unique constraint for user_id and pattern_type combination
ALTER TABLE user_edit_patterns 
ADD CONSTRAINT unique_user_pattern_type UNIQUE (user_id, pattern_type);