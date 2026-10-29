-- Seed script to insert 3 admin accounts and ensure root folder 'My Files' exists
-- Passwords hashed using bcrypt (cost factor 10)
-- admin1 -> admin1123
-- admin2 -> admin2123
-- admin3 -> admin3123

USE file_management_system;

-- 1. Insert admin users
INSERT INTO users (username, password_hash, role, display_name) VALUES
('admin1', '$2b$10$eMejA2QdhW43y5XDUnN5H.nL0UC1J54kXcJNY668J.AdJiAZcLDY.', 'admin', 'Admin 1'),
('admin2', '$2b$10$arwta4p3Qu3Q44rM.TbJku4UBz8dZLBzXozfWOJxuDd6hjY0UKaPm', 'admin', 'Admin 2'),
('admin3', '$2b$10$JYLlPfwWmgxieB8iE7GwlOe1oMdtBo.0HfAJpUQZAzNYUE/BzWj9q', 'admin', 'Admin 3')
ON DUPLICATE KEY UPDATE 
  password_hash = VALUES(password_hash),
  role = VALUES(role),
  display_name = VALUES(display_name);

-- 2. Ensure root folder 'My Files' exists (parent_id: NULL, nav_key: 'my-files')
INSERT INTO folders (name, parent_id, owner_id, nav_key)
SELECT 'My Files', NULL, id, 'my-files'
FROM users
WHERE username = 'admin1'
  AND NOT EXISTS (
    SELECT 1 FROM (SELECT id FROM folders WHERE parent_id IS NULL AND nav_key = 'my-files' AND deleted_at IS NULL) AS temp
  )
LIMIT 1;

-- 3. Add default subfolders under 'My Files' if empty
INSERT INTO folders (name, parent_id, owner_id, nav_key)
SELECT 'Documents', f.id, f.owner_id, 'documents'
FROM folders f
WHERE f.parent_id IS NULL AND f.nav_key = 'my-files' AND f.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM (SELECT id FROM folders WHERE name = 'Documents' AND parent_id = f.id AND deleted_at IS NULL) AS temp2
  )
LIMIT 1;

INSERT INTO folders (name, parent_id, owner_id, nav_key)
SELECT 'Images', f.id, f.owner_id, 'images'
FROM folders f
WHERE f.parent_id IS NULL AND f.nav_key = 'my-files' AND f.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM (SELECT id FROM folders WHERE name = 'Images' AND parent_id = f.id AND deleted_at IS NULL) AS temp3
  )
LIMIT 1;
