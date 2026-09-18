import db from './db.js';

const getAllCategories = async () => {
    const query = `
        SELECT category_id, category_name
        FROM public.category
        ORDER BY category_name;
    `;

    const result = await db.query(query);

    return result.rows;
};

const getCategoryById = async (categoryId) => {
    const query = `
        SELECT category_id, category_name
        FROM public.category
        WHERE category_id = $1;
    `;

    const result = await db.query(query, [categoryId]);

    return result.rows[0];
};

const getCategoriesByProjectId = async (projectId) => {
    const query = `
        SELECT c.category_id, c.category_name
        FROM public.category AS c
        JOIN public.project_categories AS pc
            ON pc.category_id = c.category_id
        WHERE pc.project_id = $1
        ORDER BY c.category_name;
    `;

    const result = await db.query(query, [projectId]);

    return result.rows;
};

const getProjectsByCategoryId = async (categoryId) => {
    const query = `
        SELECT p.project_id, p.project_title, p.date
        FROM public.project AS p
        JOIN public.project_categories AS pc
            ON pc.project_id = p.project_id
        WHERE pc.category_id = $1
        ORDER BY p.date, p.project_title;
    `;

    const result = await db.query(query, [categoryId]);

    return result.rows;
};

export {
    getAllCategories,
    getCategoryById,
    getCategoriesByProjectId,
    getProjectsByCategoryId
};
