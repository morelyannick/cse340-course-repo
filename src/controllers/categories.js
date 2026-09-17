import { getAllCategories } from '../models/categories.js';

export const showCategoriesPage = async (req, res) => {
  void req;

  const categories = await getAllCategories();
  const title = 'Service Categories';
  res.render('categories', { title, categories });
};
