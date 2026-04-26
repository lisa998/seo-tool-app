import { computed, Ref, useContext } from '@nuxtjs/composition-api';
import useRequestState from '~/composables/useRequestState';

interface LinkTypeDistributionItem {
  type: string;
  count: number;
  percentage: number;
}

interface LinkTypeDistributionResp {
  distribution: LinkTypeDistributionItem[];
}

export default function (targetDomain: Ref<string>) {
  const { $axios } = useContext();
  const {
    loading: linkTypeDistributionLoading,
    error: linkTypeDistributionError,
    data: linkTypeDistributionData,
    execute,
  } = useRequestState<LinkTypeDistributionResp>();

  const fetchLinkTypeDistribution = () => {
    if (!targetDomain?.value) return;
    linkTypeDistributionData.value = null;

    return execute(() =>
      $axios.$get<LinkTypeDistributionResp>(`/api/domain-overview/link-type-distribution`, {
        params: {
          domain: targetDomain.value,
        },
      }),
    );
  };

  const linkTypeDistributionChartData = computed(() => ({
    data: (linkTypeDistributionData.value?.distribution ?? []).map(({ type, percentage }) => ({
      name: type,
      y: percentage,
    })),
    seriesName: '占比',
  }));

  return {
    fetchLinkTypeDistribution,
    linkTypeDistributionLoading,
    linkTypeDistributionError,
    linkTypeDistributionData,
    linkTypeDistributionChartData,
  };
}
