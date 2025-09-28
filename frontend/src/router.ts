import { Router } from '@lit-labs/router';
import type { ReactiveElement } from '@lit/reactive-element';
import { html } from 'lit';
import { authStore } from './state/auth-store';
import { registerRouter } from './navigation';

import './components/app-shell';
import './pages/Dashboard/dashboard-page';
import './pages/Projects/projects-page';
import './pages/Projects/projects-wizard-page';
import './pages/Incidents/incidents-page';
import './pages/Deliverables/deliverables-page';
import './pages/CalendarWorkflows/calendar-workflows-page';
import './pages/OrgRoles/org-roles-page';
import './pages/AuditEvidences/audit-evidences-page';
import './pages/SystemDetail/system-detail-page';
import './pages/Settings/settings-page';
import './pages/Auth/login-page';
import './pages/Auth/sign-in-page';

function renderWithShell(content: unknown) {
  return html`<app-shell>${content}</app-shell>`;
}

type RouteParams = Record<string, string>;

export function createAppRouter(host: ReactiveElement): Router {
  let router: Router;

  const ensureAuthenticated = async (): Promise<boolean> => {
    await authStore.ensureSessionRestored();
    if (authStore.isAuthenticated) {
      return true;
    }
    if (!authStore.isRestoringSession.value) {
      const { pathname, search } = window.location;
      const redirect = encodeURIComponent(`${pathname}${search}`);
      router.goto(`/login?redirect=${redirect}`);
      window.history.replaceState({}, '', `/login?redirect=${redirect}`);
    }
    return false;
  };

  router = new Router(host, [
    {
      path: '/login',
      render: () => html`<login-page></login-page>`
    },
    {
      path: '/sign-in',
      render: () => html`<sign-in-page></sign-in-page>`
    },
    {
      path: '/',
      enter: ensureAuthenticated,
      render: () => renderWithShell(html`<dashboard-page></dashboard-page>`)
    },
    {
      path: '/projects',
      enter: ensureAuthenticated,
      render: () => renderWithShell(html`<projects-page></projects-page>`)
    },
    {
      path: '/projects/new',
      enter: ensureAuthenticated,
      render: () => renderWithShell(html`<projects-wizard-page></projects-wizard-page>`)
    },
    {
      path: '/projects/:id/incidents',
      enter: ensureAuthenticated,
      render: (params: RouteParams) =>
        renderWithShell(html`<incidents-page project-id=${params.id}></incidents-page>`)
    },
    {
      path: '/projects/:id/deliverables',
      enter: ensureAuthenticated,
      render: (params: RouteParams) =>
        renderWithShell(html`<deliverables-page project-id=${params.id}></deliverables-page>`)
    },
    {
      path: '/projects/:id/calendar',
      enter: ensureAuthenticated,
      render: (params: RouteParams) =>
        renderWithShell(html`<calendar-workflows-page project-id=${params.id}></calendar-workflows-page>`)
    },
    {
      path: '/projects/:id/org',
      enter: ensureAuthenticated,
      render: (params: RouteParams) =>
        renderWithShell(html`<org-roles-page project-id=${params.id}></org-roles-page>`)
    },
    {
      path: '/projects/:id/audit',
      enter: ensureAuthenticated,
      render: (params: RouteParams) =>
        renderWithShell(html`<audit-evidences-page project-id=${params.id}></audit-evidences-page>`)
    },
    {
      path: '/systems/:id',
      enter: ensureAuthenticated,
      render: (params: RouteParams) =>
        renderWithShell(html`<system-detail-page system-id=${params.id}></system-detail-page>`)
    },
    {
      path: '/incidents',
      enter: ensureAuthenticated,
      render: () => renderWithShell(html`<incidents-page></incidents-page>`)
    },
    {
      path: '/settings',
      enter: ensureAuthenticated,
      render: () => renderWithShell(html`<settings-page></settings-page>`)
    },
    {
      path: '.*',
      enter: ensureAuthenticated,
      render: () =>
        renderWithShell(
          html`<section class="p-10 text-center space-y-4">
            <h2 class="text-3xl font-semibold">Página no encontrada</h2>
            <p class="text-base-content/70">Revisa la URL o vuelve al panel principal.</p>
          </section>`
        )
    }
  ]);

  registerRouter(router);
  return router;
}
