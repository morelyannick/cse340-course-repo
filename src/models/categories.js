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

const createCategory = async (categoryName) => {
    const query = `
        INSERT INTO public.category (category_name)
        VALUES ($1)
        RETURNING category_id;
    `;

    const result = await db.query(query, [categoryName]);
    return result.rows[0]?.category_id;
};

const updateCategory = async (categoryId, categoryName) => {
    const query = `
        UPDATE public.category
        SET category_name = $1
        WHERE category_id = $2;
    `;

    return db.query(query, [categoryName, categoryId]);
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

const assignCategoryToProject = async (projectId, categoryId) => {
    const query = `
        INSERT INTO public.project_categories (project_id, category_id)
        VALUES ($1, $2)
        ON CONFLICT (project_id, category_id) DO NOTHING;
    `;

    await db.query(query, [projectId, categoryId]);
};

const updateCategoryAssignments = async (projectId, categoryIds = []) => {
    const deleteQuery = `
        DELETE FROM public.project_categories
        WHERE project_id = $1;
    `;

    await db.query(deleteQuery, [projectId]);

    for (const categoryId of [...new Set(categoryIds)]) {
        await assignCategoryToProject(projectId, categoryId);
    }
};

export {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    getCategoriesByProjectId,
    getProjectsByCategoryId,
    updateCategoryAssignments
};
