import { computed, Ref, ref, useContext } from '@nuxtjs/composition-api';
import withLoading from '~/utils/withLoading';

interface LinkTypeDistributionItem {
  type: string;
  count: number;
  percentage: number;
}

interface LinkTypeDistributionResp {
  distribution: LinkTypeDistributionItem[];
}

export default function (targetDomain: Ref<string>) {
  const linkTypeDistributionLoading = ref(false);
  const linkTypeDistributionData = ref<LinkTypeDistributionResp | null>(null);

  const { $axios } = useContext();

  const fetchLinkTypeDistribution = () =>
    withLoading(linkTypeDistributionLoading, async () => {
      if (!targetDomain?.value) return;

      linkTypeDistributionData.value = await $axios.$get<LinkTypeDistributionResp>(
        `/api/domain-overview/link-type-distribution`,
        {
          params: {
            domain: targetDomain.value,
          },
        },
      );
    });

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
    linkTypeDistributionData,
    linkTypeDistributionChartData,
  };
}
