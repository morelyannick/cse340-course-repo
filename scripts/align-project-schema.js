import { readFile } from 'node:fs/promises';
import db from '../src/models/db.js';

try {
  const migration = await readFile('src/migrations/002_align_project_schema.sql', 'utf8');
  await db.query(migration);

  const result = await db.query(`
    SELECT
      EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'project'
          AND column_name = 'date'
      ) AS has_date_column,
      EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'project'
          AND column_name = 'location'
      ) AS has_location_column,
      to_regclass('public.project_categories') IS NOT NULL AS has_project_categories_table,
      (SELECT COUNT(*) FROM public.project_categories) AS project_category_count;
  `);

  const status = result.rows[0];
  if (
    !status.has_date_column ||
    !status.has_location_column ||
    !status.has_project_categories_table ||
    status.project_category_count < 5
  ) {
    throw new Error('Project schema verification failed after migration.');
  }

  const projects = await db.query(`
    SELECT p.project_id, p.project_title, p.date, p.location, o.name AS organization_name
    FROM public.project AS p
    JOIN public.organization AS o
      ON p.organization_id = o.organization_id
    ORDER BY p.date;
  `);

  console.log(
    `Project schema aligned successfully with ${projects.rowCount} projects and ${status.project_category_count} category associations.`
  );
} finally {
  await db.close();
}
