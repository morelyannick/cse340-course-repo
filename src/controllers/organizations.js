import {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization
} from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';
import { body, validationResult } from 'express-validator';

export const organizationValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Organization name is required.')
    .isLength({ min: 3, max: 150 })
    .withMessage('Organization name must be between 3 and 150 characters.')
    .escape(),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Organization description is required.')
    .isLength({ max: 500 })
    .withMessage('Organization description cannot exceed 500 characters.')
    .escape(),
  body('contactEmail')
    .trim()
    .notEmpty()
    .withMessage('Organization email is required.')
    .isEmail()
    .withMessage('Organization email must be valid.')
    .normalizeEmail()
];

export const showOrganizationsPage = async (req, res) => {
  void req;

  const organizations = await getAllOrganizations();
  const title = 'Our Partner Organizations';
  res.render('organizations', { title, organizations });
};

export const showNewOrganizationForm = async (req, res) => {
  const title = 'Add New Organization';

  res.render('new-organization', { title });
};

export const processNewOrganizationForm = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    errors.array().forEach(({ msg }) => req.flash('error', msg));
    return res.redirect('/new-organization');
  }

  const { name, description, contactEmail } = req.body;
  const logoFilename = 'placeholder-logo.png';

  const organizationId = await createOrganization(name, description, contactEmail, logoFilename);
  req.flash('success', 'Organization created successfully.');
  res.redirect(`/organization/${organizationId}`);
};

export const showEditOrganizationForm = async (req, res, next) => {
  const organization = await getOrganizationById(req.params.id);

  if (!organization) {
    const error = new Error('Organization Not Found');
    error.status = 404;
    return next(error);
  }

  const title = 'Edit Organization';
  res.render('edit-organization', { title, organization });
};

export const processEditOrganizationForm = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    errors.array().forEach(({ msg }) => req.flash('error', msg));
    return res.redirect(`/edit-organization/${req.params.id}`);
  }

  const { name, description, contactEmail, logoFilename } = req.body;

  await updateOrganization(
    req.params.id,
    name,
    description,
    contactEmail,
    logoFilename
  );

  req.flash('success', 'Organization updated successfully.');
  res.redirect(`/organization/${req.params.id}`);
};

export const showOrganizationPage = async (req, res, next) => {
  const organization = await getOrganizationById(req.params.id);

  if (!organization) {
    const error = new Error('Organization Not Found');
    error.status = 404;
    return next(error);
  }

  const projects = await getProjectsByOrganizationId(req.params.id);
  const title = organization.name;

  res.render('organization', { title, organization, projects });
};
