import { ref, useContext } from '@nuxtjs/composition-api';
import withLoading from '~/utils/withLoading';

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

export default function () {
  const { $axios } = useContext();

  const overviewData = ref<OverviewItem[]>([]);
  const overviewLoading = ref<boolean>(false);

  const fetchOverview = async () => {
    const data = await $axios.$get<FetchData>(`/api/site-explorer/overview`, {
      params: { domain: 'mysite.com' },
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

  const fetchOverviewWithLoading = () => withLoading(overviewLoading, fetchOverview);

  return { fetchOverviewWithLoading, overviewData, overviewLoading };
}
