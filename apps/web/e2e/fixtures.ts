import {test as base} from '@playwright/test';
import {CollectionPage} from './pages/CollectionPage';
import {CollectionsPage} from './pages/CollectionsPage';
import {JobHistoryPage} from './pages/JobHistoryPage';
import {JobPage} from './pages/JobPage';
import {JobsPage} from './pages/JobsPage';
import {VariablePage} from './pages/VariablePage';
import {VariablesPage} from './pages/VariablesPage';
import {MockRoutes} from './routes';

export {expect} from '@playwright/test';

type Fixtures = {
  mock: MockRoutes;
  collectionsPage: CollectionsPage;
  collectionPage: CollectionPage;
  variablesPage: VariablesPage;
  variablePage: VariablePage;
  jobsPage: JobsPage;
  jobPage: JobPage;
  jobHistoryPage: JobHistoryPage;
  forEachTest: void;
};

export const test = base.extend<Fixtures>({
  mock: ({page}, use) => use(new MockRoutes(page)),
  collectionsPage: async ({page, mock}, use) => {
    await mock.listCollections();
    await use(new CollectionsPage(page));
  },
  collectionPage: async ({page, mock}, use) => {
    await mock.getCollection();
    await use(new CollectionPage(page));
  },
  variablesPage: async ({page, mock}, use) => {
    await mock.listCollections();
    await mock.listVariables();
    await use(new VariablesPage(page));
  },
  variablePage: async ({page, mock}, use) => {
    await mock.listCollections();
    await mock.getVariable();
    await use(new VariablePage(page));
  },
  jobsPage: async ({page, mock}, use) => {
    await mock.listCollections();
    await mock.listJobs();
    await use(new JobsPage(page));
  },
  jobPage: async ({page, mock}, use) => {
    await mock.listCollections();
    await mock.getJob();
    await use(new JobPage(page));
  },
  jobHistoryPage: async ({page, mock}, use) => {
    await mock.getJob();
    await mock.getJobStatus();
    await mock.getJobHistory();
    await use(new JobHistoryPage(page));
  },
  forEachTest: [
    async ({page}, use) => {
      await page.route('**/*.css', (route) => route.abort());
      await use();
    },
    {auto: true},
  ],
});
