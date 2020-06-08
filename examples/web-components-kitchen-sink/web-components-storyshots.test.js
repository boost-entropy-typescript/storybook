import path from 'path';
import initStoryshots, { multiSnapshotWithOptions } from '@storybook/addon-storyshots';

jest.mock('./addon-jest.testresults.json', () => ({}), { virtual: true });
jest.mock('./documentation.json', () => ({}), { virtual: true });
jest.mock('./environments/environment', () => ({}), { virtual: true });

initStoryshots({
  framework: 'web-components',
  integrityOptions: { cwd: path.join(__dirname, 'src', 'stories') },
  configPath: path.join(__dirname, '.storybook'),
  test: multiSnapshotWithOptions(),
});
