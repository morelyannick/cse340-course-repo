import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import ejs from 'ejs';
import flash from '../src/middleware/flash.js';

const viewsDirectory = path.resolve('src/views');
const baseData = {
  title: 'Test page',
  organizations: [],
  projects: [],
  categories: [],
  message: 'Test error',
  path: '/missing-page',
  NODE_ENV: 'development',
  error: 'Test error',
  stack: 'Test stack'
};

for (const view of [
  'home',
  'organizations',
  'new-organization',
  'projects',
  'categories',
  'errors/404',
  'errors/500'
]) {
  test(`${view} view renders`, async () => {
    const filename = path.join(viewsDirectory, `${view}.ejs`);
    const template = await readFile(filename, 'utf8');
    const html = ejs.render(template, baseData, { filename });

    assert.match(html, /<html lang="en">/);
    assert.match(html, /CSE 340 Service Network/);
  });
}

test('projects view renders a project with an optional location', async () => {
  const filename = path.join(viewsDirectory, 'projects.ejs');
  const template = await readFile(filename, 'utf8');
  const html = ejs.render(template, {
    ...baseData,
    projects: [{
      project_title: 'Park Cleanup',
      date: '2026-10-10',
      location: 'Riverside Park',
      organization_name: 'UnityServe Volunteers'
    }]
  }, { filename });

  assert.match(html, /Riverside Park/);
});

test('users view renders names, emails, and roles', async () => {
  const filename = path.join(viewsDirectory, 'users.ejs');
  const template = await readFile(filename, 'utf8');
  const html = ejs.render(template, {
    ...baseData,
    users: [{ name: 'Admin', email: 'admin@example.com', role_name: 'admin' }]
  }, { filename });

  assert.match(html, /Admin/);
  assert.match(html, /admin@example\.com/);
  assert.match(html, />admin</);
});

test('dashboard only shows the users link to admins', async () => {
  const filename = path.join(viewsDirectory, 'dashboard.ejs');
  const template = await readFile(filename, 'utf8');
  const commonData = { ...baseData, name: 'Test User', email: 'user@example.com' };
  const adminHtml = ejs.render(template, {
    ...commonData,
    user: { role_name: 'admin' }
  }, { filename });
  const regularUserHtml = ejs.render(template, {
    ...commonData,
    user: { role_name: 'user' }
  }, { filename });

  assert.match(adminHtml, /href="\/users"/);
  assert.doesNotMatch(regularUserHtml, /href="\/users"/);
});

test('flash middleware returns flattened message objects for templates', () => {
  const req = { session: {} };
  const res = { locals: {} };

  flash(req, res, () => {});
  req.flash('success', 'Created successfully');
  req.flash('error', 'This failed');

  const messages = req.flash();

  assert.deepEqual(messages, [
    { type: 'success', message: 'Created successfully' },
    { type: 'error', message: 'This failed' }
  ]);
  assert.deepEqual(req.session.flash, {
    success: [],
    error: [],
    warning: [],
    info: []
  });
});
