import { getAllProjects } from '../models/projects.js';

export const showProjectsPage = async (req, res) => {
  void req;

  const projects = await getAllProjects();
  const title = 'Service Projects';
  res.render('projects', { title, projects });
};
