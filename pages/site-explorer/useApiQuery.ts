import { computed, reactive, Ref, ref, toRef, useContext, watch } from '@nuxtjs/composition-api';
import useRouteQuery from '~/composables/useRouteQuery';
import withLoading from '~/utils/withLoading';
import { BacklinksApiDto, backlinksMapper, BacklinksViewModel } from '~/mappers/site-explorer/backlinks.mapper';
import {
  ReferringDomainsApiDto,
  referringDomainsMapper,
  ReferringDomainsViewModel,
} from '~/mappers/site-explorer/referringDomains.mapper';
import { AnchorsApiDto, anchorsMapper, AnchorsViewModel } from '~/mappers/site-explorer/anchors.mapper';
import { BrokenLinksApiDto, brokenLinksMapper, BrokenLinksViewModel } from '~/mappers/site-explorer/brokenLinks';

const linkAnalysisKeys = ['backlinks', 'referring-domains', 'anchors', 'broken-links'] as const;

export type LinkAnalysisKey = (typeof linkAnalysisKeys)[number];

interface Query {
  [key: string]: string | number;
}

type ApiDtoMap = {
  backlinks: BacklinksApiDto;
  'referring-domains': ReferringDomainsApiDto;
  anchors: AnchorsApiDto;
  'broken-links': BrokenLinksApiDto;
};

interface Pagination {
  cursor: string | null;
  hasMore: boolean;
  total: number;
}

interface ApiResp<K extends LinkAnalysisKey = LinkAnalysisKey> {
  data: ApiDtoMap[K][];
  pagination: Pagination;
}

type ViewModelMap = {
  backlinks: BacklinksViewModel;
  'referring-domains': ReferringDomainsViewModel;
  anchors: AnchorsViewModel;
  'broken-links': BrokenLinksViewModel;
};

type Mapper = { [K in LinkAnalysisKey]: (dto: ApiDtoMap[K]) => ViewModelMap[K] };

export default function (domain: Ref<string>) {
  const defaultLinkAnalysisMap = (defaultFactory: () => any) =>
    linkAnalysisKeys.reduce(
      (obj, k) => {
        obj[k] = defaultFactory();
        return obj;
      },
      {} as Record<LinkAnalysisKey, any>,
    );

  const queryObject = reactive<Record<LinkAnalysisKey, Query>>(defaultLinkAnalysisMap(() => ({})));
  const activeTab = ref<LinkAnalysisKey>('backlinks');
  const currentQuery = computed(() => {
    const currentTab = activeTab.value;
    return queryObject?.[currentTab] ? { ...queryObject[currentTab], tab: currentTab } : {};
  });

  const { defaultQuery } = useRouteQuery(currentQuery);
  if (defaultQuery?.tab && linkAnalysisKeys.includes(defaultQuery.tab as LinkAnalysisKey)) {
    activeTab.value = defaultQuery.tab as LinkAnalysisKey;
    const { tab, ...rest } = defaultQuery;
    if (Object.keys(rest).length > 0) {
      queryObject[activeTab.value] = rest;
    }
  }

  const dataObject = reactive<Record<LinkAnalysisKey, any>>(
    defaultLinkAnalysisMap(() => ({
      data: [],
      pagination: {},
    })),
  );
  const loadingStatus = reactive<Record<LinkAnalysisKey, boolean>>(defaultLinkAnalysisMap(() => false));
  const errorStatus = reactive<Record<LinkAnalysisKey, unknown>>(defaultLinkAnalysisMap(() => null));

  const { $axios } = useContext();
  const mapper: Mapper = {
    backlinks: backlinksMapper,
    'referring-domains': referringDomainsMapper,
    anchors: anchorsMapper,
    'broken-links': brokenLinksMapper,
  };

  const createFetchTask = <K extends LinkAnalysisKey>(key: K) => {
    return () =>
      withLoading(
        toRef(loadingStatus, key),
        async () => {
          const queryParams = queryObject[key] || {};
          Object.entries(queryParams).forEach(([k, v]) => {
            if (!v) {
              delete queryParams[k];
            }
          });
          if (!domain?.value) return;
          dataObject[key] = { data: [], pagination: {} };
          const { data, pagination } = await $axios.$get<ApiResp<K>>(`/api/site-explorer/${key}`, {
            params: { domain: domain.value, ...queryParams },
          });
          dataObject[key] = {
            data: data.map((d) => mapper[key](d)),
            pagination,
          };
        },
        toRef(errorStatus, key),
      );
  };

  const fetchTableFuncArray = linkAnalysisKeys.map((key) => createFetchTask(key));

  const fetchCurrentTask = computed(() => createFetchTask(activeTab.value));

  watch(currentQuery, async () => {
    await fetchCurrentTask.value();
  });

  return { queryObject, activeTab, dataObject, loadingStatus, errorStatus, fetchTableFuncArray };
}
