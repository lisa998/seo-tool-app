import { computed, Ref, ref, useContext, useFetch } from '@nuxtjs/composition-api';

interface SerpResult {
  position: number;
  url: string;
  title: string;
  domainRating: number;
  urlRating: number;
  backlinks: number;
  traffic: number;
  featuredSnippet: boolean;
}

export default function (search: Ref<{ keyword: string }>) {
  const { $axios } = useContext();
  const serpData = ref<SerpResult[]>([]);
  const serpRankingLoading = ref(false);

  const { fetch: fetchSerpRanking } = useFetch(async () => {
    if (!search.value.keyword) return;
    serpRankingLoading.value = true;
    const { results } = await $axios.$get(`/api/keyword/serp`, {
      params: {
        keyword: search.value.keyword,
      },
    });
    serpData.value = results;
    serpRankingLoading.value = false;
  });

  const tableSerpData = computed(() =>
    serpData.value.map((item) => {
      return {
        rank: item.position,
        url: item.url,
        dr: item.domainRating,
        ur: item.urlRating,
        backlinks: item.backlinks,
        traffic: item.traffic,
      };
    }),
  );

  return { tableSerpData, fetchSerpRanking, serpRankingLoading };
}
