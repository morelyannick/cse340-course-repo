import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { authenticateUser, createUser } from '../models/users.js';

export const userRegistrationValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters.'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Enter a valid email address.')
    .isLength({ max: 100 })
    .withMessage('Email cannot exceed 100 characters.')
    .normalizeEmail(),
  body('password')
    .isString()
    .withMessage('Password is required.')
    .isLength({ min: 8, max: 72 })
    .withMessage('Password must be between 8 and 72 characters.')
];

export const showUserRegistrationForm = (req, res) => {
  res.render('register', { title: 'Register' });
};

export const processUserRegistrationForm = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    errors.array().forEach(({ msg }) => req.flash('error', msg));
    return res.redirect('/register');
  }

  const { name, email, password } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await createUser(name, email, passwordHash);

    req.flash('success', 'Registration successful! Please log in.');
    return res.redirect('/dashboard');
  } catch (error) {
    if (error.code === '23505') {
      req.flash('error', 'An account with this email already exists.');
    } else {
      console.error('Error registering user:', error);
      req.flash('error', 'An error occurred during registration. Please try again.');
    }

    return res.redirect('/register');
  }
};

export const showLoginForm = (req, res) => {
  if (req.query.loggedOut === '1') {
    req.flash('success', 'Logout successful!');
  }

  res.render('login', { title: 'Login' });
};

export const processLoginForm = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await authenticateUser(email, password);

    if (!user) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/login');
    }

    req.session.user = user;
    req.flash('success', 'Login successful!');

    if (res.locals.NODE_ENV === 'development') {
      console.log('User logged in:', user);
    }

    return res.redirect('/');
  } catch (error) {
    console.error('Error during login:', error);
    req.flash('error', 'An error occurred during login. Please try again.');
    return res.redirect('/login');
  }
};

export const processLogout = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error('Error during logout:', error);
      req.flash('error', 'An error occurred during logout. Please try again.');
      return res.redirect('/login');
    }

    // Flash is stored in the session, so set it on the fresh login request.
    return res.redirect('/login?loggedOut=1');
  });
};

export const requireLogin = (req, res, next) => {
  if (!req.session?.user) {
    req.flash('error', 'You must be logged in to access that page.');
    return res.redirect('/login');
  }

  return next();
};

export const showDashboard = (req, res) => {
  const { name, email } = req.session.user;

  res.render('dashboard', {
    title: 'Dashboard',
    name,
    email
  });
};
