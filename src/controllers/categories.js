import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  getProjectsByCategoryId,
  getCategoriesByProjectId,
  updateCategoryAssignments
} from '../models/categories.js';
import { getProjectDetails } from '../models/projects.js';
import { body, validationResult } from 'express-validator';

export const categoryValidation = [
  body('categoryName')
    .trim()
    .notEmpty().withMessage('Category name is required.')
    .isLength({ min: 3, max: 100 })
    .withMessage('Category name must be between 3 and 100 characters.')
];

export const showCategoriesPage = async (req, res) => {
  void req;

  const categories = await getAllCategories();
  const title = 'Service Categories';
  res.render('categories', { title, categories });
};

export const showNewCategoryForm = (req, res) => {
  void req;
  const title = 'Add New Category';
  res.render('new-category', { title });
};

export const processNewCategoryForm = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().forEach(({ msg }) => req.flash('error', msg));
    return res.redirect('/new-category');
  }

  try {
    await createCategory(req.body.categoryName);
  } catch (error) {
    if (error.code === '23505') {
      req.flash('error', 'A category with that name already exists.');
      return res.redirect('/new-category');
    }
    return next(error);
  }

  req.flash('success', 'Category created successfully.');
  res.redirect('/categories');
};

export const showEditCategoryForm = async (req, res, next) => {
  const category = await getCategoryById(req.params.id);

  if (!category) {
    const error = new Error('Category Not Found');
    error.status = 404;
    return next(error);
  }

  const title = 'Edit Category';
  res.render('edit-category', { title, category });
};

export const processEditCategoryForm = async (req, res, next) => {
  const category = await getCategoryById(req.params.id);

  if (!category) {
    const error = new Error('Category Not Found');
    error.status = 404;
    return next(error);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().forEach(({ msg }) => req.flash('error', msg));
    return res.redirect(`/edit-category/${req.params.id}`);
  }

  try {
    await updateCategory(req.params.id, req.body.categoryName);
  } catch (error) {
    if (error.code === '23505') {
      req.flash('error', 'A category with that name already exists.');
      return res.redirect(`/edit-category/${req.params.id}`);
    }
    return next(error);
  }

  req.flash('success', 'Category updated successfully.');
  res.redirect(`/category/${req.params.id}`);
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
