import {
  getProjectDetails,
  getUpcomingProjects,
  createProject,
  updateProject
} from '../models/projects.js';
import { getCategoriesByProjectId } from '../models/categories.js';
import { getAllOrganizations } from '../models/organizations.js';
import {
  addVolunteerToProject,
  removeVolunteerFromProject
} from '../models/projectvolunteers.js';
import { body, validationResult } from 'express-validator';

const NUMBER_OF_UPCOMING_PROJECTS = 5;

export const projectValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Project title is required.')
    .isLength({ min: 3, max: 150 })
    .withMessage('Project title must be between 3 and 150 characters.'),
  body('description')
    .trim()
    .notEmpty().withMessage('Project description is required.')
    .isLength({ max: 999 })
    .withMessage('Project description must be less than 1000 characters.'),
  body('location')
    .trim()
    .notEmpty().withMessage('Project location is required.')
    .isLength({ max: 150 })
    .withMessage('Project location must be less than 200 characters.'),
  body('date')
    .notEmpty().withMessage('Project date is required.')
    .isISO8601({ strict: true })
    .withMessage('Project date must be a valid date.'),
  body('organizationId')
    .notEmpty().withMessage('Organization is required.')
    .isInt({ min: 1 })
    .withMessage('Organization must be a valid selection.')
];

export const showProjectsPage = async (req, res) => {
  void req;

  const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
  const title = 'Upcoming Service Projects';
  res.render('projects', { title, projects });
};

export const showProjectDetailsPage = async (req, res, next) => {
  const project = await getProjectDetails(req.params.id);

  if (!project) {
    const error = new Error('Project Not Found');
    error.status = 404;
    return next(error);
  }

  const categories = await getCategoriesByProjectId(req.params.id);
  const title = project.title;
  res.render('project', { title, project, categories });
};

export const processVolunteerSignup = async (req, res) => {
  const projectId = Number(req.params.id);
  const projectPath = `/project/${encodeURIComponent(req.params.id)}`;

  if (!Number.isSafeInteger(projectId) || projectId < 1) {
    req.flash('error', 'Invalid project.');
    return res.redirect('/projects');
  }

  const project = await getProjectDetails(projectId);
  if (!project) {
    req.flash('error', 'That project could not be found.');
    return res.redirect('/projects');
  }

  const association = await addVolunteerToProject(req.session.user.user_id, projectId);
  req.flash(
    association ? 'success' : 'info',
    association ? 'You signed up for this project.' : 'You are already signed up for this project.'
  );
  return res.redirect(projectPath);
};

export const processVolunteerWithdrawal = async (req, res) => {
  const projectId = Number(req.params.id);
  const projectPath = `/project/${encodeURIComponent(req.params.id)}`;

  if (!Number.isSafeInteger(projectId) || projectId < 1) {
    req.flash('error', 'Invalid project.');
    return res.redirect('/projects');
  }

  const project = await getProjectDetails(projectId);
  if (!project) {
    req.flash('error', 'That project could not be found.');
    return res.redirect('/projects');
  }

  const association = await removeVolunteerFromProject(req.session.user.user_id, projectId);
  req.flash(
    association ? 'success' : 'info',
    association ? 'You withdrew from this project.' : 'You were not signed up for this project.'
  );
  return res.redirect(req.body.returnTo === 'dashboard' ? '/dashboard' : projectPath);
};

export const showNewProjectForm = async (req, res) => {
  const organizations = await getAllOrganizations();
  const title = 'Add New Service Project';
  res.render('new-project', { title, organizations });
};

export const processNewProjectForm = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    errors.array().forEach(({ msg }) => req.flash('error', msg));
    return res.redirect('/new-project');
  }

  const { title, description, location, date, organizationId } = req.body;
  await createProject(title, description, location, date, organizationId);

  req.flash('success', 'New service project created successfully.');
  res.redirect('/projects');
};

export const showEditProjectForm = async (req, res, next) => {
  const project = await getProjectDetails(req.params.id);

  if (!project) {
    const error = new Error('Project Not Found');
    error.status = 404;
    return next(error);
  }

  const organizations = await getAllOrganizations();
  const title = 'Edit Service Project';
  res.render('edit-project', { title, project, organizations });
};

export const processEditProjectForm = async (req, res, next) => {
  const projectId = req.params.id;
  const project = await getProjectDetails(projectId);

  if (!project) {
    const error = new Error('Project Not Found');
    error.status = 404;
    return next(error);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().forEach(({ msg }) => req.flash('error', msg));
    return res.redirect(`/edit-project/${projectId}`);
  }

  const { title, description, location, date, organizationId } = req.body;
  await updateProject(projectId, title, description, location, date, organizationId);

  req.flash('success', 'Service project updated successfully.');
  res.redirect(`/project/${projectId}`);
};
