import express from 'express';
import { showHomePage } from './controllers/index.js';
import {
  showOrganizationsPage,
  showOrganizationPage
} from './controllers/organizations.js';
import { showProjectsPage } from './controllers/projects.js';
import { showCategoriesPage } from './controllers/categories.js';
import { testErrorPage } from './controllers/errors.js';

const router = express.Router();

const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.get('/', wrap(showHomePage));
router.get('/organizations', wrap(showOrganizationsPage));
router.get('/organization/:id', wrap(showOrganizationPage));
router.get('/projects', wrap(showProjectsPage));
router.get('/categories', wrap(showCategoriesPage));
router.get('/test-error', testErrorPage);

export default router;
