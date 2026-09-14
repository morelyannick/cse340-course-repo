-- Adds the location field required by the projects page without removing existing data.
ALTER TABLE public.project
    ADD COLUMN IF NOT EXISTS location VARCHAR(150);
