import {
  getProjectDetails,
  getUpcomingProjects
} from '../models/projects.js';

const NUMBER_OF_UPCOMING_PROJECTS = 5;

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

  const title = project.title;
  res.render('project', { title, project });
};
