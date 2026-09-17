-- Adds the project description required by the project details page.
ALTER TABLE public.project
ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';