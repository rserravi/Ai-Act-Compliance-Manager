import { t } from '../../shared/i18n';

export type NotificationSetting = {
  id: string;
  label: string;
  description: string;
};

export function getNotificationSettings(): NotificationSetting[] {
  return [
    {
      id: 'incidents',
      label: t('settings.notifications.items.incidents.label'),
      description: t('settings.notifications.items.incidents.description')
    },
    {
      id: 'deliverables',
      label: t('settings.notifications.items.deliverables.label'),
      description: t('settings.notifications.items.deliverables.description')
    },
    {
      id: 'audits',
      label: t('settings.notifications.items.audits.label'),
      description: t('settings.notifications.items.audits.description')
    }
  ];
}
