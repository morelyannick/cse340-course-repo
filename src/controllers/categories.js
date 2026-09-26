import {
  getAllCategories,
  getCategoryById,
  getProjectsByCategoryId,
  getCategoriesByProjectId,
  updateCategoryAssignments
} from '../models/categories.js';
import { getProjectDetails } from '../models/projects.js';

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

export const showAssignCategoriesForm = async (req, res, next) => {
  const { projectId } = req.params;
  const projectDetails = await getProjectDetails(projectId);

  if (!projectDetails) {
    const error = new Error('Project Not Found');
    error.status = 404;
    return next(error);
  }

  const [categories, assignedCategories] = await Promise.all([
    getAllCategories(),
    getCategoriesByProjectId(projectId)
  ]);

  const title = 'Assign Categories to Project';
  res.render('assign-categories', {
    title,
    projectId,
    projectDetails,
    categories,
    assignedCategories
  });
};

export const processAssignCategoriesForm = async (req, res, next) => {
  const { projectId } = req.params;
  const projectDetails = await getProjectDetails(projectId);

  if (!projectDetails) {
    const error = new Error('Project Not Found');
    error.status = 404;
    return next(error);
  }

  const selectedCategoryIds = req.body.categoryIds ?? [];
  const categoryIds = Array.isArray(selectedCategoryIds)
    ? selectedCategoryIds
    : [selectedCategoryIds];

  await updateCategoryAssignments(projectId, categoryIds);
  req.flash('success', 'Categories updated successfully.');
  res.redirect(`/project/${projectId}`);
};
