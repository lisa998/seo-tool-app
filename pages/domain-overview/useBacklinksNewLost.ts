import { computed, Ref, ref, useContext } from '@nuxtjs/composition-api';
import withLoading from '~/utils/withLoading';
import { chartColors } from '~/components/chart/chartTheme';

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
  const backlinksNewLostData = ref<BacklinksNewLostResp | null>(null);

  const { $axios } = useContext();

  const fetchBacklinksNewLost = () =>
    withLoading(backlinksNewLostLoading, async () => {
      if (!targetDomain?.value) return;

      backlinksNewLostData.value = await $axios.$get<BacklinksNewLostResp>(`/api/domain-overview/backlinks-new-lost`, {
        params: {
          domain: targetDomain.value,
          range: activeRange.value,
        },
      });
    });

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

  return { fetchBacklinksNewLost, backlinksNewLostLoading, backlinksNewLostData, backlinksNewLostChartData };
}
