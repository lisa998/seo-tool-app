import { Ref, ref, useContext } from '@nuxtjs/composition-api';
import withLoading from '~/utils/withLoading';
import { formatCompactNumber } from '~/utils/formatCompactNumber';

interface SummaryResp {
  domain: string;
  ahrefsRank: number;
  ahrefsRankDelta: number;
  domainRating: number;
  domainRatingDelta: number;
  backlinks: number;
  backlinksDelta: number;
  referringDomains: number;
  organicTraffic: number;
  organicKeywords: number;
}

interface SummaryItem {
  title: string;
  metrics: string | number;
  variation: number;
}

export default function (targetDomain: Ref<string>) {
  const summaryLoading = ref(false);
  const summaryData = ref<SummaryItem[]>([]);

  const { $axios } = useContext();

  const fetchSummary = () =>
    withLoading(summaryLoading, async () => {
      if (!targetDomain?.value) return;

      const data = await $axios.$get<SummaryResp>(`/api/domain-overview/summary`, {
        params: { domain: targetDomain.value },
      });
      summaryData.value = [
        {
          title: 'Ahrefs Rank',
          metrics: '#' + data?.ahrefsRank.toLocaleString(),
          variation: data?.ahrefsRankDelta || 0,
        },
        {
          title: 'DR',
          metrics: data?.domainRating || 0,
          variation: data?.domainRatingDelta || 0,
        },
        {
          title: '反向連結',
          metrics: formatCompactNumber(data?.backlinks || 0, 1),
          variation: data?.backlinksDelta || 0,
        },
      ];
    });

  return { fetchSummary, summaryLoading, summaryData };
}
