import type { Router } from '@lit-labs/router';

let activeRouter: Router | null = null;

export function registerRouter(router: Router): void {
  activeRouter = router;
}

export function navigateTo(path: string, options?: { replace?: boolean }): void {
  if (activeRouter) {
    activeRouter.goto(path);
    if (options?.replace) {
      window.history.replaceState({}, '', path);
    }
    return;
  }

  if (options?.replace) {
    window.history.replaceState({}, '', path);
  } else {
    window.history.pushState({}, '', path);
  }
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function getCurrentPath(): string {
  return window.location.pathname;
}
