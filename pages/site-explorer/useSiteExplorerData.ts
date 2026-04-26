import { Ref, ref, useContext } from '@nuxtjs/composition-api';
import useRequestState from '~/composables/useRequestState';

const Metrics = ['domainRating', 'backlinks', 'referringDomains', 'organicTraffic'] as const;
type MetricsData = Record<(typeof Metrics)[number], number>;
type SparklinesData = Record<(typeof Metrics)[number], number[]>;

interface FetchData {
  domain: string;
  metrics: MetricsData;
  sparklines: SparklinesData;
}

interface OverviewItem {
  title: string;
  metrics: number;
  sparklines: { x: number; y: number }[];
}

export default function (domain: Ref<string>) {
  const { $axios } = useContext();

  const overviewData = ref<OverviewItem[]>([]);

  const fetchOverview = async () => {
    if (!domain?.value) return;
    overviewData.value = [];
    const data = await $axios.$get<FetchData>(`/api/site-explorer/overview`, {
      params: { domain: domain?.value },
    });
    overviewData.value = [
      {
        title: 'DR 評分',
        metrics: data.metrics.domainRating,
        sparklines: data.sparklines.domainRating.map((item: number, index: number) => ({
          x: index * 10,
          y: item,
        })),
      },
      {
        title: '反向連結數',
        metrics: data.metrics.backlinks,
        sparklines: data.sparklines.backlinks.map((item: number, index: number) => ({
          x: index * 10,
          y: item,
        })),
      },
      {
        title: '參照網域數',
        metrics: data.metrics.referringDomains,
        sparklines: data.sparklines.referringDomains.map((item: number, index: number) => ({
          x: index * 10,
          y: item,
        })),
      },
      {
        title: '自然流量',
        metrics: data.metrics.organicTraffic,
        sparklines: data.sparklines.organicTraffic.map((item: number, index: number) => ({
          x: index * 10,
          y: item,
        })),
      },
    ];
  };

  const { loading: overviewLoading, error: overviewError, execute } = useRequestState();

  const fetchOverviewWithLoading = () => execute(fetchOverview);

  return { fetchOverviewWithLoading, overviewData, overviewLoading, overviewError };
}
