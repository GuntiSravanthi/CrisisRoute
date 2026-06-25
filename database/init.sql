-- CrisisRoute PostgreSQL Database Setup
-- Run: psql -U postgres -f database/init.sql

CREATE DATABASE crisisroute;

\c crisisroute;

-- Tables are auto-created by SQLAlchemy on first run.
-- This script ensures the database exists and sets up extensions.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Optional: Grant permissions (adjust username as needed)
-- GRANT ALL PRIVILEGES ON DATABASE crisisroute TO postgres;

COMMENT ON DATABASE crisisroute IS 'CrisisRoute - AI-Powered Disaster Assistance Platform';
