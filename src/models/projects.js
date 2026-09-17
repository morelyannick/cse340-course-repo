import db from './db.js';

const getAllProjects = async () => {
    const query = `
        SELECT
            p.project_id,
            p.project_title,
            p.date,
            p.location,
            o.name AS organization_name
        FROM public.project AS p
        JOIN public.organization AS o
            ON p.organization_id = o.organization_id
        ORDER BY p.date;
    `;

    const result = await db.query(query);

    return result.rows;
};

const getUpcomingProjects = async (numberOfProjects) => {
    const query = `
        SELECT
            p.project_id,
            p.project_title AS title,
            p.description,
            p.date,
            p.location,
            p.organization_id,
            o.name AS organization_name
        FROM public.project AS p
        JOIN public.organization AS o
            ON p.organization_id = o.organization_id
        WHERE p.date >= CURRENT_DATE
        ORDER BY p.date ASC
        LIMIT $1;
    `;

    const result = await db.query(query, [numberOfProjects]);

    return result.rows;
};

const getProjectDetails = async (id) => {
    const query = `
        SELECT
            p.project_id,
            p.project_title AS title,
            p.description,
            p.date,
            p.location,
            p.organization_id,
            o.name AS organization_name
        FROM public.project AS p
        JOIN public.organization AS o
            ON p.organization_id = o.organization_id
        WHERE p.project_id = $1;
    `;

    const result = await db.query(query, [id]);

    return result.rows[0];
};

const getProjectsByOrganizationId = async (organizationId) => {
    const query = `
        SELECT project_id, project_title, date, location, organization_id
        FROM public.project
        WHERE organization_id = $1
        ORDER BY date;
    `;

    const result = await db.query(query, [organizationId]);

    return result.rows;
};

export {
    getAllProjects,
    getUpcomingProjects,
    getProjectDetails,
    getProjectsByOrganizationId
};
