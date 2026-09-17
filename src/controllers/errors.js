export const testErrorPage = (req, res, next) => {
  void req;
  void res;

  const err = new Error('This is a test error');
  err.status = 500;
  next(err);
};

export const notFound = (req, res, next) => {
  void req;
  void res;

  const err = new Error('Page Not Found');
  err.status = 404;
  next(err);
};

export const globalErrorHandler = (err, req, res, next) => {
  void req;
  void next;

  console.error('Error occurred:', err.message);
  console.error('Stack trace:', err.stack);

  const status = err.status || 500;
  const template = status === 404 ? '404' : '500';

  const context = {
    title: status === 404 ? 'Page Not Found' : 'Server Error',
    error: err.message,
    stack: err.stack
  };

  res.status(status).render(`errors/${template}`, context);
};
