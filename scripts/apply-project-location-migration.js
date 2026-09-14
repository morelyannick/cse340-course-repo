import db from '../src/models/db.js';

try {
  await db.query(`
    ALTER TABLE public.project
    ADD COLUMN IF NOT EXISTS location VARCHAR(150);
  `);

  const result = await db.query(`
    SELECT p.project_id, p.project_title, p.date, p.location, o.name
    FROM public.project AS p
    JOIN public.organization AS o
      ON p.organization_id = o.organization_id;
  `);

  console.log('Project location migration applied successfully.');
  console.log(`Validated ${result.rowCount} project records.`);
} finally {
  await db.close();
}
