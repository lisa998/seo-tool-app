import { computed, Ref, useContext } from '@nuxtjs/composition-api';
import useRequestState from '~/composables/useRequestState';
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
  const { $axios } = useContext();
  const {
    loading: backlinksNewLostLoading,
    error: backlinksNewLostError,
    data: backlinksNewLostData,
    execute,
  } = useRequestState<BacklinksNewLostResp>();

  const fetchBacklinksNewLost = () => {
    if (!targetDomain?.value) return;
    backlinksNewLostData.value = null;

    return execute(() =>
      executeCache<BacklinksNewLostResp>(`${targetDomain.value}:${activeRange.value}:backlinksNewLost`, () =>
        $axios.$get<BacklinksNewLostResp>(`/api/domain-overview/backlinks-new-lost`, {
          params: {
            domain: targetDomain.value,
            range: activeRange.value,
          },
        }),
      ),
    );
  };

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
