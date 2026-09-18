import {
  getAllCategories,
  getCategoryById,
  getProjectsByCategoryId
} from '../models/categories.js';

export const showCategoriesPage = async (req, res) => {
  void req;

  const categories = await getAllCategories();
  const title = 'Service Categories';
  res.render('categories', { title, categories });
};

export const showCategoryDetailsPage = async (req, res, next) => {
  const category = await getCategoryById(req.params.id);

  if (!category) {
    const error = new Error('Category Not Found');
    error.status = 404;
    return next(error);
  }

  const projects = await getProjectsByCategoryId(req.params.id);
  const title = category.category_name;

  res.render('category', { title, category, projects });
};
