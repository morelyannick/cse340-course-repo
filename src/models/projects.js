import db from './db.js';

const getAllProjects = async () => {
    const query = `
        SELECT
            p.project_id,
            p.project_title,
            p.project_date,
            o.name AS organization_name
        FROM public.project AS p
        JOIN public.organization AS o
            ON p.organization_id = o.organization_id
        ORDER BY p.project_date;
    `;

    const result = await db.query(query);

    return result.rows;
};

export { getAllProjects };
