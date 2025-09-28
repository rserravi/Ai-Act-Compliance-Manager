export type NotificationSetting = {
  id: string;
  label: string;
  description: string;
};

export function getNotificationSettings(): NotificationSetting[] {
  return [
    {
      id: 'incidents',
      label: 'Alertas de incidentes',
      description: 'Recibe un correo cuando se registre un nuevo incidente crítico.'
    },
    {
      id: 'deliverables',
      label: 'Recordatorios de entregables',
      description: 'Avisos semanales de entregables próximos a vencer.'
    },
    {
      id: 'audits',
      label: 'Ejecución de auditorías',
      description: 'Notificaciones sobre auditorías programadas y resultados.'
    }
  ];
}
