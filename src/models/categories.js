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

export { getAllCategories };
