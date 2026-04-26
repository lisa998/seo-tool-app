import { computed, ref, useContext } from '@nuxtjs/composition-api';
import useRequestState from '~/composables/useRequestState';

export const SERP_FEATURES = [
  'featured_snippet',
  'people_also_ask',
  'image_pack',
  'video',
  'knowledge_panel',
  'local_pack',
  'top_stories',
  'shopping_results',
  'site_links',
] as const;

type SerpFeature = (typeof SERP_FEATURES)[number];

export default function (search: { keyword: string }) {
  const { $axios } = useContext();
  const serpFeaturesHistoryData = ref<{ date: string; features: SerpFeature[] }[]>([]);
  const { loading: serpFeaturesLoading, error: serpFeaturesError, execute } = useRequestState();

  const fetchSerpFeaturesHistory = () =>
    execute(async () => {
      if (!search.keyword) return;
      serpFeaturesHistoryData.value = [];
      const { history } = await $axios.$get(`/api/keyword/serp-features-history`, {
        params: {
          keyword: search.keyword,
        },
      });
      serpFeaturesHistoryData.value = history;
    });

  const heatmapData = computed(() => {
    if (serpFeaturesHistoryData.value.length === 0) return { date: [], features: [] };

    const date: string[] = [];
    const features: Array<Array<number>> = [];

    serpFeaturesHistoryData.value.forEach((item, dateIndex) => {
      date.push(item.date.split('-').slice(0, 2).join('-'));
      const featuresArray = SERP_FEATURES.map((feature, featureIndex) => [
        dateIndex,
        featureIndex,
        item.features.includes(feature) ? 1 : 0,
      ]);
      features.push(...featuresArray);
    });

    return { date, features };
  });

  const allSerpFeatures = [...SERP_FEATURES];

  return {
    serpFeaturesHistoryData,
    heatmapData,
    allSerpFeatures,
    serpFeaturesLoading,
    serpFeaturesError,
    fetchSerpFeaturesHistory,
  };
}
