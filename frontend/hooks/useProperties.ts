import useSWR from 'swr';
import { api } from '@/lib/api/client';
import { SearchFilters, SearchResponse, Property } from '@/lib/api/contracts';

function fetcher(key: [string, SearchFilters]): Promise<SearchResponse> {
  const [, filters] = key;
  return api.searchProperties(filters);
}

export function useProperties(filters: SearchFilters) {
  return useSWR<SearchResponse, Error>(
    ['/properties/search', filters],
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
      keepPreviousData: true,
    }
  );
}

export function useProperty(id: string | null) {
  return useSWR<Property, Error>(
    id ? ['/properties', id] : null,
    ([, id]) => api.getProperty(id),
    {
      revalidateOnFocus: false,
    }
  );
}

export function mutateProperties() {
  return useSWR.mutate('/properties/search');
}