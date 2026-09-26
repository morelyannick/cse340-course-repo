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
  processAssignCategoriesForm
} from './controllers/categories.js';
import { testErrorPage } from './controllers/errors.js';

const router = express.Router();

const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.get('/', wrap(showHomePage));
router.get('/organizations', wrap(showOrganizationsPage));
router.get('/new-organization', wrap(showNewOrganizationForm));
router.post(
  '/new-organization',
  organizationValidation,
  wrap(processNewOrganizationForm)
);
router.get('/organization/:id', wrap(showOrganizationPage));
router.get('/edit-organization/:id', wrap(showEditOrganizationForm));
router.post(
  '/edit-organization/:id',
  organizationValidation,
  wrap(processEditOrganizationForm)
);
router.get('/projects', wrap(showProjectsPage));
router.get('/new-project', wrap(showNewProjectForm));
router.post('/new-project', projectValidation, wrap(processNewProjectForm));
router.get('/edit-project/:id', wrap(showEditProjectForm));
router.post('/edit-project/:id', projectValidation, wrap(processEditProjectForm));
router.get('/project/:id', wrap(showProjectDetailsPage));
router.get('/categories', wrap(showCategoriesPage));
router.get('/category/:id', wrap(showCategoryDetailsPage));
router.get('/assign-categories/:projectId', wrap(showAssignCategoriesForm));
router.post('/assign-categories/:projectId', wrap(processAssignCategoriesForm));
router.get('/test-error', testErrorPage);

export default router;
