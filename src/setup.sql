-- Remove dependent tables first so this script is safe to run repeatedly.
DROP TABLE IF EXISTS public.project_categories CASCADE;
DROP TABLE IF EXISTS public.project_category CASCADE;
DROP TABLE IF EXISTS public.project CASCADE;
DROP TABLE IF EXISTS public.category CASCADE;
DROP TABLE IF EXISTS public.organization CASCADE;

-- ========================================
-- Organization Table
-- ========================================
CREATE TABLE public.organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_filename VARCHAR(255) NOT NULL
);

-- ========================================
-- Insert sample data: Organizations
-- ========================================
INSERT INTO organization (name, description, contact_email, logo_filename) 
VALUES 
(
    'BrightFuture Builders', 
    'A nonprofit focused on improving community infrastructure through sustainable construction projects.', 
    'info@brightfuturebuilders.org', 
    'brightfuture-logo.png'
),
(
    'GreenHarvest Growers', 
    'An urban farming collective promoting food sustainability and education in local neighborhoods.', 
    'contact@greenharvest.org', 
    'greenharvest-logo.png'
),
(
    'UnityServe Volunteers', 
    'A volunteer coordination group supporting local charities and service initiatives.', 
    'hello@unityserve.org', 
    'unityserve-logo.png'
);

-- Create projects table
CREATE TABLE public.project (
    project_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_title VARCHAR(150) NOT NULL,
    date DATE NOT NULL,
    location VARCHAR(150) NOT NULL,
    organization_id INTEGER NOT NULL REFERENCES public.organization (organization_id)
);

-- Insert project records
INSERT INTO public.project (project_title, date, location, organization_id)
VALUES
    (
        'Park Cleanup',
        '2026-10-10',
        'Riverside Park',
        (SELECT organization_id FROM public.organization WHERE name = 'UnityServe Volunteers')
    ),
    (
        'Food Drive',
        '2026-10-17',
        'Community Center',
        (SELECT organization_id FROM public.organization WHERE name = 'GreenHarvest Growers')
    ),
    (
        'Community Tutoring',
        '2026-10-24',
        'Lincoln Middle School',
        (SELECT organization_id FROM public.organization WHERE name = 'BrightFuture Builders')
    ),
    (
        'Neighborhood Garden',
        '2026-10-31',
        'Eastside Community Garden',
        (SELECT organization_id FROM public.organization WHERE name = 'GreenHarvest Growers')
    ),
    (
        'School Renovation',
        '2026-11-07',
        'Westview Elementary School',
        (SELECT organization_id FROM public.organization WHERE name = 'BrightFuture Builders')
    ),
    (
        'Senior Center Support',
        '2026-11-14',
        'Downtown Senior Center',
        (SELECT organization_id FROM public.organization WHERE name = 'BrightFuture Builders')
    );

-- ========================================
-- Category tables
-- ========================================
CREATE TABLE public.category (
    category_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE public.project_categories (
    project_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (project_id, category_id),
    CONSTRAINT project_category_project_fk
        FOREIGN KEY (project_id)
        REFERENCES public.project (project_id)
        ON DELETE CASCADE,
    CONSTRAINT project_category_category_fk
        FOREIGN KEY (category_id)
        REFERENCES public.category (category_id)
        ON DELETE CASCADE
);

INSERT INTO public.category (category_name)
VALUES
    ('Education'),
    ('Environment'),
    ('Food Security'),
    ('Community Service')
ON CONFLICT (category_name) DO NOTHING;

-- Associate every existing project with at least one category.
INSERT INTO public.project_categories (project_id, category_id)
SELECT
    p.project_id,
    c.category_id
FROM public.project AS p
JOIN public.category AS c
    ON c.category_name = CASE p.project_title
        WHEN 'Community Tutoring' THEN 'Education'
        WHEN 'School Renovation' THEN 'Education'
        WHEN 'Park Cleanup' THEN 'Environment'
        WHEN 'Neighborhood Garden' THEN 'Environment'
        WHEN 'Food Drive' THEN 'Food Security'
        WHEN 'Senior Center Support' THEN 'Community Service'
        ELSE 'Community Service'
    END
ON CONFLICT (project_id, category_id) DO NOTHING;

-- Verify the category associations.
SELECT
    p.project_id,
    p.project_title,
    c.category_name
FROM public.project AS p
    JOIN public.project_categories AS pc
    ON pc.project_id = p.project_id
JOIN public.category AS c
    ON c.category_id = pc.category_id
ORDER BY p.project_id, c.category_name;
