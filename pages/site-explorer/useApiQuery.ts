import { computed, reactive, ref } from '@nuxtjs/composition-api';
import useRouteQuery from '~/composables/useRouteQuery';

const linkAnalysisKeys = ['backlinks', 'referring-domains', 'anchors', 'broken-links'] as const;

export type LinkAnalysisKey = (typeof linkAnalysisKeys)[number];

interface Query {
  [key: string]: string | number;
}

export default function () {
  const queryObject = reactive<Record<LinkAnalysisKey, Query>>(
    linkAnalysisKeys.reduce(
      (obj, k) => {
        obj[k] = {};
        return obj;
      },
      {} as Record<LinkAnalysisKey, Query>,
    ),
  );
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

  return { queryObject, activeTab };
}
