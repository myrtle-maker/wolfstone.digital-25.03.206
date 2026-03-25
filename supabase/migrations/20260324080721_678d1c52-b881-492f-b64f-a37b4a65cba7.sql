ALTER TABLE profiles ADD COLUMN monthly_refresh_credits integer NOT NULL DEFAULT 5;
ALTER TABLE profiles ADD COLUMN last_credit_reset timestamp with time zone NOT NULL DEFAULT now();

-- Give admins unlimited (9999)
UPDATE profiles SET monthly_refresh_credits = 9999 
WHERE id IN (SELECT user_id FROM user_roles WHERE role = 'admin');