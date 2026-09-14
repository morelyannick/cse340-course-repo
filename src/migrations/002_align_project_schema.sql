-- Aligns existing databases with the required project schema without deleting data.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'project'
          AND column_name = 'project_date'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'project'
          AND column_name = 'date'
    ) THEN
        ALTER TABLE public.project RENAME COLUMN project_date TO date;
    END IF;

    IF to_regclass('public.project_categories') IS NULL
       AND to_regclass('public.project_category') IS NOT NULL THEN
        ALTER TABLE public.project_category RENAME TO project_categories;
    END IF;
END $$;
