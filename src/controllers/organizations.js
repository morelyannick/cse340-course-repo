import {
  getAllOrganizations,
  getOrganizationById
} from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';

export const showOrganizationsPage = async (req, res) => {
  void req;

  const organizations = await getAllOrganizations();
  const title = 'Our Partner Organizations';
  res.render('organizations', { title, organizations });
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
