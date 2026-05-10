import { NotificationRulesFormType, RankTrackerNotificationRule } from '~/pages/rank-tracker/types';

export interface RankTrackerRulesViewModel {
  ruleName: string;
  triggerCondition: string;
  notifyChannels: string;
  enabled: boolean;
}

export const rulesMapper = (rules: RankTrackerNotificationRule[]): RankTrackerRulesViewModel[] =>
  rules.map((rule) => ({
    ruleName: rule.name,
    triggerCondition: rule.condition.metric + (rule.condition.threshold !== null ? `> ${rule.condition.threshold}` : ''),
    notifyChannels: rule.channels.join(','),
    enabled: rule.enabled,
  }));

export const ruleToPayloadMapper = (rule: NotificationRulesFormType): Partial<RankTrackerNotificationRule> => ({
  name: rule.ruleName,
  condition: {
    metric: rule.triggerCondition,
    threshold: rule.threshold || null,
  },
  channels: rule.notifyChannels,
  enabled: rule.enabled,
});
