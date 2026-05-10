import { useContext } from '@nuxtjs/composition-api';
import useRequestState from '~/composables/useRequestState';
import type { CreateRankTrackerNotificationRulePayload } from '~/pages/rank-tracker/types';
import { RankTrackerRulesViewModel, rulesMapper } from '~/mappers/rank-tracker/rules.mapper';

export default function () {
  const { $axios } = useContext();

  const {
    loading: notificationRulesLoading,
    error: notificationRulesError,
    data: notificationRules,
    execute: executeFetch,
  } = useRequestState<RankTrackerRulesViewModel[]>(null);

  const {
    loading: createNotificationRuleLoading,
    error: createNotificationRuleError,

    execute: executeCreate,
  } = useRequestState(null);

  const fetchNotificationRules = () =>
    executeFetch(() => $axios.$get('/api/rank-tracker/notification-rules').then((d) => rulesMapper(d.rules)));

  const createNotificationRule = (payload: CreateRankTrackerNotificationRulePayload) =>
    executeCreate(async () => {
      const { data, status } = await $axios.post('/api/rank-tracker/notification-rules', payload);
      if (status === 201 && data) {
        const [mappedRule] = rulesMapper([data]);
        notificationRules.value = [...(notificationRules?.value || []), mappedRule];
      }
      return null;
    });

  return {
    notificationRules,
    fetchNotificationRules,
    notificationRulesLoading,
    notificationRulesError,
    createNotificationRule,
    createNotificationRuleLoading,
    createNotificationRuleError,
  };
}
