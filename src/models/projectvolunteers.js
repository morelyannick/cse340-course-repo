import db from './db.js';

// 1. Add a volunteer to a project
export async function addVolunteerToProject(userId, projectId) {
  const query = `
    INSERT INTO public.project_volunteers (user_id, project_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, project_id) DO NOTHING
    RETURNING user_id, project_id;
  `;
  const values = [userId, projectId];
  const result = await db.query(query, values);
  return result.rows[0]; // returns the association created
}

// 2. Remove a volunteer from a project
export async function removeVolunteerFromProject(userId, projectId) {
  const query = `
    DELETE FROM public.project_volunteers
    WHERE user_id = $1 AND project_id = $2
    RETURNING user_id, project_id;
  `;
  const values = [userId, projectId];
  const result = await db.query(query, values);
  return result.rows[0]; // returns the association removed
}

// 3. Get all projects associated with a specific user
export async function getProjectsByUser(userId) {
  const query = `
    SELECT p.project_id, p.project_title, p.date, p.location, o.name AS organization_name
    FROM public.project_volunteers pv
    JOIN public.project p ON pv.project_id = p.project_id
    JOIN public.organization o ON p.organization_id = o.organization_id
    WHERE pv.user_id = $1
    ORDER BY p.date ASC;
  `;
  const values = [userId];
  const result = await db.query(query, values);
  return result.rows; // returns the list of projects
}
