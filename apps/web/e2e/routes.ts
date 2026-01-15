import type {Page} from '@playwright/test';
import {samples} from './samples';

export class MockRoutes {
  constructor(private readonly page: Page) {
    this.page.route(/\/(collections|variables|jobs)/, (route) => route.abort());
  }

  listCollections(items = samples.collections) {
    return this.mockList('/collections', items);
  }

  getCollection() {
    return this.mockGet('/collections/*', samples.collections);
  }

  createCollection(status = 201) {
    return this.mockPost('/collections', status);
  }

  updateCollection(status = 204) {
    return this.mockPatch('/collections/*', status);
  }

  deleteCollection(status = 204) {
    return this.mockDelete('/collections/*', status);
  }

  listVariables(items = samples.variables) {
    return this.mockList('/variables', items);
  }

  getVariable() {
    return this.mockGet('/variables/*', samples.variables);
  }

  createVariable(status = 201) {
    return this.mockPost('/variables', status);
  }

  updateVariable(status = 204) {
    return this.mockPatch('/variables/*', status);
  }

  deleteVariable(status = 204) {
    return this.mockDelete('/variables/*', status);
  }

  listJobs(items = samples.jobs) {
    return this.mockList('/jobs?*', items);
  }

  getJob() {
    return this.mockGet('/jobs/*', samples.jobs);
  }

  createJob(status = 201) {
    return this.mockPost('/jobs', status);
  }

  updateJob(status = 204) {
    return this.mockPatch('/jobs/*', status);
  }

  deleteJob(status = 204) {
    return this.mockDelete('/jobs/*', status);
  }

  getJobStatus() {
    return this.page.route('/jobs/*/status', (route) => {
      if (route.request().method() !== 'GET') return route.fallback();
      return route.fulfill({json: samples.jobStatus});
    });
  }

  updateJobStatus(status = 204) {
    return this.page.route('/jobs/*/status', (route) => {
      if (route.request().method() !== 'PATCH') return route.fallback();
      return route.fulfill({status});
    });
  }

  getJobHistory() {
    return this.mockList('/jobs/*/history', samples.jobHistory);
  }

  deleteJobHistory(status = 204) {
    return this.mockDelete('/jobs/*/history', status);
  }

  private mockList(url: string, items: unknown[]) {
    return this.page.route(url, (route) => {
      if (route.request().method() !== 'GET') return route.fallback();
      route.fulfill({json: {items}});
    });
  }

  private mockGet(url: string, items: {id?: string}[]) {
    return this.page.route(url, (route) => {
      if (route.request().method() !== 'GET') return route.fallback();
      const id = route.request().url().split('/').pop();
      const item = items.find((item) => item.id === id);
      return item ? route.fulfill({json: item}) : route.fulfill({status: 404});
    });
  }

  private mockPost(url: string, status: number) {
    return this.page.route(url, (route) => {
      if (route.request().method() !== 'POST') return route.fallback();
      return route.fulfill({status, json: 'abc'});
    });
  }

  private mockPatch(url: string, status: number) {
    return this.page.route(url, (route) => {
      if (route.request().method() !== 'PATCH') return route.fallback();
      return route.fulfill({status});
    });
  }

  private mockDelete(url: string, status: number) {
    return this.page.route(url, (route) => {
      if (route.request().method() !== 'DELETE') return route.fallback();
      return route.fulfill({status});
    });
  }
}
