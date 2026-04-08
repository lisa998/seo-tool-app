import { computed, ref, ssrRef, useContext } from '@nuxtjs/composition-api';

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

export default function (search: { keyword: string }) {
  const { $axios } = useContext();
  const serpData = ssrRef<SerpResult[]>([], 'serpData');
  const serpRankingLoading = ref(false);

  const fetchSerpRanking = async () => {
    if (!search.keyword) return;
    serpRankingLoading.value = true;
    const { results } = await $axios.$get(`/api/keyword/serp`, {
      params: {
        keyword: search.keyword,
      },
    });
    serpData.value = results;
    serpRankingLoading.value = false;
  };

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
