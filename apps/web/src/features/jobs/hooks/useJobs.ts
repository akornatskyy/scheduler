import {api as collectionsApi} from '$features/collections';
import {type Errors, toErrorMap} from '$shared/errors';
import {useEffect, useState} from 'react';
import * as api from '../api';
import type {CollectionItem, JobItem} from '../types';

export function useJobs(collectionId?: string | null) {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [errors, setErrors] = useState<Errors>();

  useEffect(() => {
    const refresh = async () => {
      try {
        const [{items: collections}, {items: jobs}] = await Promise.all([
          collectionsApi.listCollections(),
          api.listJobs({collectionId}),
        ]);

        setCollections(collections);
        setJobs(jobs);
      } catch (error) {
        setErrors(toErrorMap(error));
      }
    };

    refresh();
    const timer = setInterval(refresh, 10000);
    return () => clearInterval(timer);
  }, [collectionId]);

  return {collections, jobs, errors};
}
