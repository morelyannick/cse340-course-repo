import { readFile } from 'node:fs/promises';
import db from '../src/models/db.js';

try {
  const migration = await readFile(
    'src/migrations/003_add_project_description.sql',
    'utf8'
  );

  await db.query(migration);

  const result = await db.query(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'project'
        AND column_name = 'description'
    ) AS has_description_column;
  `);

  if (!result.rows[0].has_description_column) {
    throw new Error('Project description column was not created.');
  }

  console.log('Project description migration applied successfully.');
} finally {
  await db.close();
}
