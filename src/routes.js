import express from 'express';
import { showHomePage } from './controllers/index.js';
import {
  showOrganizationsPage,
  showOrganizationPage,
  showNewOrganizationForm,
  processNewOrganizationForm,
  organizationValidation,
  showEditOrganizationForm,
  processEditOrganizationForm
} from './controllers/organizations.js';
import {
  showProjectsPage,
  showProjectDetailsPage,
  showNewProjectForm,
  processNewProjectForm,
  projectValidation,
  showEditProjectForm,
  processEditProjectForm
} from './controllers/projects.js';
import {
  showCategoriesPage,
  showCategoryDetailsPage,
  showAssignCategoriesForm,
  processAssignCategoriesForm,
  showNewCategoryForm,
  processNewCategoryForm,
  showEditCategoryForm,
  processEditCategoryForm,
  categoryValidation
} from './controllers/categories.js';
import { testErrorPage } from './controllers/errors.js';
import {
  showUserRegistrationForm,
  processUserRegistrationForm,
  userRegistrationValidation,
  showLoginForm,
  processLoginForm,
  processLogout,
  requireLogin,
  requireRole,
  usersPage,
  showDashboard
} from './controllers/users.js';

const router = express.Router();

const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.get('/', wrap(showHomePage));
router.get('/organizations', wrap(showOrganizationsPage));
router.get('/new-organization', requireRole('admin'), wrap(showNewOrganizationForm));
router.post(
  '/new-organization',
  requireRole('admin'),
  organizationValidation,
  wrap(processNewOrganizationForm)
);
router.get('/organization/:id', wrap(showOrganizationPage));
router.get('/edit-organization/:id', requireRole('admin'), wrap(showEditOrganizationForm));
router.post(
  '/edit-organization/:id',
  requireRole('admin'),
  organizationValidation,
  wrap(processEditOrganizationForm)
);
router.get('/projects', wrap(showProjectsPage));
router.get('/new-project', requireRole('admin'), wrap(showNewProjectForm));
router.post('/new-project', requireRole('admin'), projectValidation, wrap(processNewProjectForm));
router.get('/edit-project/:id', requireRole('admin'), wrap(showEditProjectForm));
router.post('/edit-project/:id', requireRole('admin'), projectValidation, wrap(processEditProjectForm));
router.get('/project/:id', wrap(showProjectDetailsPage));
router.get('/categories', wrap(showCategoriesPage));
router.get('/new-category', requireRole('admin'), wrap(showNewCategoryForm));
router.post('/new-category', requireRole('admin'), categoryValidation, wrap(processNewCategoryForm));
router.get('/edit-category/:id', requireRole('admin'), wrap(showEditCategoryForm));
router.post('/edit-category/:id', requireRole('admin'), categoryValidation, wrap(processEditCategoryForm));
router.get('/category/:id', wrap(showCategoryDetailsPage));
router.get('/assign-categories/:projectId', requireRole('admin'), wrap(showAssignCategoriesForm));
router.post('/assign-categories/:projectId', requireRole('admin'), wrap(processAssignCategoriesForm));
router.get('/register', wrap(showUserRegistrationForm));
router.post(
  '/register',
  userRegistrationValidation,
  wrap(processUserRegistrationForm)
);
router.get('/login', wrap(showLoginForm));
router.post('/login', wrap(processLoginForm));
router.get('/logout', processLogout);
router.get('/dashboard', requireLogin, wrap(showDashboard));
router.get('/users', requireRole('admin'), wrap(usersPage));
router.get('/test-error', testErrorPage);

export default router;
