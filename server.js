import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { testConnection } from './src/models/db.js';
import { getAllOrganizations } from './src/models/organizations.js';
import { getAllProjects } from './src/models/projects.js';
import { getAllCategories } from './src/models/categories.js';

// Define the application environment
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';

// Define the port number the server will listen on
const PORT = process.env.PORT || 3000;

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configure Express middleware
 */

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Tell Express where to find your templates
app.set('views', path.join(__dirname, 'src/views'));

// Forward rejected promises and thrown errors to the error middleware
const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Routes
 */

app.get('/', wrap(async (req, res) => {
  const title = 'Home';
  res.render('home', { title });
}));

app.get('/organizations', wrap(async (req, res) => {
  const organizations = await getAllOrganizations();
  const title = 'Our Partner Organizations';
  res.render('organizations', { title, organizations });
}));

app.get('/projects', wrap(async (req, res) => {
  const projects = await getAllProjects();
  const title = 'Service Projects';
  res.render('projects', { title, projects });
}));

app.get('/categories', wrap(async (req, res) => {
  const categories = await getAllCategories();
  const title = 'Project Categories';
  res.render('categories', { title, categories });
}));

// Handle requests that do not match an existing route
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
    path: req.originalUrl
  });
});

// Handle errors forwarded by routes and middleware
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).render('error', {
    title: 'Server Error',
    message: NODE_ENV === 'production' ? 'Something went wrong.' : err.message
  });
});

app.listen(PORT, async () => {
  try {
    await testConnection();
    console.log(`Server is running at http://127.0.0.1:${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
});
