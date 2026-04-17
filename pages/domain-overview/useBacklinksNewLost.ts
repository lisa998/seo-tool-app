import { computed, Ref, ref, useContext } from '@nuxtjs/composition-api';
import withLoading from '~/utils/withLoading';
import { chartColors } from '~/components/chart/chartTheme';
import { executeCache } from '~/composables/useCachedFetch';

interface BacklinksNewLostDataPoint {
  month: string;
  new: number;
  lost: number;
}

interface BacklinksNewLostResp {
  dataPoints: BacklinksNewLostDataPoint[];
}

export default function (targetDomain: Ref<string>, activeRange: Ref<string>) {
  const backlinksNewLostLoading = ref(false);
  const backlinksNewLostError = ref<unknown>(null);
  const backlinksNewLostData = ref<BacklinksNewLostResp | null>(null);

  const { $axios } = useContext();

  const fetchBacklinksNewLost = () =>
    withLoading(
      backlinksNewLostLoading,
      async () => {
        if (!targetDomain?.value) return;
        backlinksNewLostData.value = null;

        backlinksNewLostData.value = await executeCache(
          `${targetDomain.value}:${activeRange.value}:backlinksNewLost`,
          () =>
            $axios.$get<BacklinksNewLostResp>(`/api/domain-overview/backlinks-new-lost`, {
              params: {
                domain: targetDomain.value,
                range: activeRange.value,
              },
            }),
        );
      },
      backlinksNewLostError,
    );

  const backlinksNewLostChartData = computed(() => {
    const dataPoints = backlinksNewLostData.value?.dataPoints ?? [];

    return {
      categories: dataPoints.map(({ month }) => month),
      series: [
        {
          name: '新增',
          color: chartColors.success,
          data: dataPoints.map(({ new: newCount }) => newCount),
        },
        {
          name: '流失',
          color: chartColors.danger,
          data: dataPoints.map(({ lost }) => lost),
        },
      ],
    };
  });

  return {
    fetchBacklinksNewLost,
    backlinksNewLostLoading,
    backlinksNewLostError,
    backlinksNewLostData,
    backlinksNewLostChartData,
  };
}
