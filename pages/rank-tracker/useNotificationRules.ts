import { useContext } from '@nuxtjs/composition-api';
import useRequestState from '~/composables/useRequestState';
import { NotificationRulesFormType, RankTrackerNotificationRule } from '~/pages/rank-tracker/types';
import {
  formatCondition,
  RankTrackerRulesViewModel,
  rulesMapper,
  ruleToPayloadMapper,
} from '~/mappers/rank-tracker/rules.mapper';
import { Notification } from 'element-ui';

const MAX_RETRY_COUNT = 3;

export default function () {
  const { $axios } = useContext();

  const {
    loading: notificationRulesLoading,
    error: notificationRulesError,
    data: notificationRules,
    execute: executeFetch,
  } = useRequestState<RankTrackerRulesViewModel[]>([]);

  const fetchNotificationRules = () =>
    executeFetch(() => $axios.$get('/api/rank-tracker/notification-rules').then((d) => rulesMapper(d.rules)));

  const { loading: createNotificationRuleLoading, execute: executeCreate } = useRequestState(null);

  const createNotificationRule = (payload: NotificationRulesFormType) => {
    if (createNotificationRuleLoading.value) return;
    return executeCreate(async () => {
      // optimistic update
      const temp = {
        ...payload,
        id: crypto.randomUUID(),
        triggerCondition: formatCondition(payload.triggerCondition, payload.threshold),
        notifyChannels: payload.notifyChannels.join(','),
      };
      notificationRules.value = [...(notificationRules?.value || []), temp];

      const mappedPayload = ruleToPayloadMapper(payload);
      const isCreated = await createNotificationRuleRequest(mappedPayload, 0);

      if (!isCreated) {
        // revert optimistic update
        rollbackCreateNotificationRule(temp.id);
      }
      return null;
    });
  };

  const createNotificationRuleRequest = async (
    mappedPayload: RankTrackerNotificationRule,
    retryCount: number,
  ): Promise<boolean> => {
    const errorMessage =
      retryCount < MAX_RETRY_COUNT ? '建立通知規則失敗，自動重試中...' : '建立通知規則失敗，重試超過三次，請稍後再試';

    try {
      const { status } = await $axios.post('/api/rank-tracker/notification-rules', mappedPayload, {
        errorMessage,
      });
      if (status !== 201) {
        Notification.error({
          title: '建立通知規則失敗',
          message: '目前已有該規則',
        });
        return false;
      }
      if (retryCount) {
        Notification.success({
          type: 'success',
          title: '操作成功',
          message: `第 ${retryCount} 次重試成功`,
        });
      }
      return true;
    } catch (e) {
      if (retryCount < MAX_RETRY_COUNT) {
        return await createNotificationRuleRequest(mappedPayload, retryCount + 1);
      }
      return false;
    }
  };

  const rollbackCreateNotificationRule = (tempId: string) => {
    notificationRules.value = (notificationRules.value || []).filter((rule) => rule?.id !== tempId);
  };

  return {
    notificationRules,
    fetchNotificationRules,
    notificationRulesLoading,
    notificationRulesError,
    createNotificationRule,
    createNotificationRuleLoading,
  };
}
