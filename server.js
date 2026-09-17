import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { testConnection } from './src/models/db.js';
import routes from './src/routes.js';
import { globalErrorHandler, notFound } from './src/controllers/errors.js';

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

// Middleware to log all incoming requests
app.use((req, res, next) => {
  if (NODE_ENV === 'development') {
    console.log(`${req.method} ${req.url}`);
  }
  next();
});

// Middleware to make NODE_ENV available to all templates
app.use((req, res, next) => {
  res.locals.NODE_ENV = NODE_ENV;
  next();
});

/**
 * Routes
 */
app.use(routes);

// Catch-all route for 404 errors
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

const startServer = async () => {
  try {
    await testConnection();
    const server = app.listen(PORT, () => {
      console.log(`Server is running at http://127.0.0.1:${PORT}`);
      console.log(`Environment: ${NODE_ENV}`);
    });

    server.on('error', (error) => {
      console.error(`Unable to start server on port ${PORT}:`, error.message);
      process.exitCode = 1;
    });
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exitCode = 1;
  }
};

startServer();
