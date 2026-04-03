const routes = {
  home: '/',
  siteExplorer: '/site-explorer',
  domainOverview: '/domain-overview',
  keywordExplorer: '/keyword-explorer',
  siteAudit: '/site-audit',
  rankTracker: '/rank-tracker',
  contentExplorer: '/content-explorer',
  competitiveDashboard: '/competitive-dashboard',
  aiCopywriting: '/ai-copywriting',
};

export const navItems = [
  {
    name: 'Site Explorer',
    icon: 'el-icon-s-data',
    link: routes.siteExplorer,
  },
  {
    name: 'Domain Overview',
    icon: 'el-icon-search',
    link: routes.domainOverview,
  },
  {
    name: 'Keyword Explorer',
    icon: 'el-icon-collection',
    link: routes.keywordExplorer,
  },
  {
    name: 'Site Audit',
    icon: 'el-icon-location-outline',
    link: routes.siteAudit,
  },
  {
    name: 'Rank Tracker',
    icon: 'el-icon-edit',
    link: routes.rankTracker,
  },
  {
    name: 'Content Explorer',
    icon: 'el-icon-reading',
    link: routes.contentExplorer,
  },
  {
    name: 'Competitive Dashboard',
    icon: 'el-icon-s-marketing',
    link: routes.competitiveDashboard,
  },
  {
    name: 'AI Copywriting',
    icon: 'el-icon-chat-dot-round',
    link: routes.aiCopywriting,
  },
];
