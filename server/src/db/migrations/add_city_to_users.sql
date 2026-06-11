-- Migration: Add city column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
