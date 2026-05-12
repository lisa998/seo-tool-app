import { NotificationRulesFormType, RankTrackerNotificationRule } from '~/pages/rank-tracker/types';

export interface RankTrackerRulesViewModel {
  id?: string;
  ruleName: string;
  triggerCondition: string;
  notifyChannels: string;
  enabled: boolean;
}

export const formatCondition = (metric: string, threshold: number | null) =>
  metric + (threshold !== null ? `> ${threshold}` : '');

export const rulesMapper = (rules: RankTrackerNotificationRule[]): RankTrackerRulesViewModel[] =>
  rules.map((rule) => ({
    ruleName: rule.name,
    triggerCondition: formatCondition(rule.condition.metric, rule.condition.threshold),
    notifyChannels: rule.channels.join(','),
    enabled: rule.enabled,
  }));

export const ruleToPayloadMapper = (rule: NotificationRulesFormType): RankTrackerNotificationRule => ({
  name: rule.ruleName,
  condition: {
    metric: rule.triggerCondition,
    threshold: rule.threshold || null,
  },
  channels: rule.notifyChannels,
  enabled: rule.enabled,
});
