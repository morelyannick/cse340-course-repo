import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import ejs from 'ejs';

const viewsDirectory = path.resolve('src/views');
const baseData = {
  title: 'Test page',
  organizations: [],
  projects: [],
  categories: [],
  message: 'Test error',
  path: '/missing-page'
};

for (const view of ['home', 'organizations', 'projects', 'categories', '404', 'error']) {
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
