-- Check if the demo user already exists
DO $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE id = '550e8400-e29b-41d4-a716-446655440000'::uuid
  ) INTO user_exists;
  
  IF NOT user_exists THEN
    -- Insert a demo user into auth.users table
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      role
    ) VALUES (
      '550e8400-e29b-41d4-a716-446655440000'::uuid,
      'demo@example.com',
      '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12', -- dummy encrypted password
      NOW(),
      NOW(),
      NOW(),
      'authenticated'
    );
    
    RAISE NOTICE 'Demo user created successfully';
  ELSE
    RAISE NOTICE 'Demo user already exists';
  END IF;
END $$;
