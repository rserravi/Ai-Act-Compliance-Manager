import type { Router } from '@lit-labs/router';

let activeRouter: Router | null = null;

export function registerRouter(router: Router): void {
  activeRouter = router;
}

export function navigateTo(path: string, options?: Parameters<Router['goto']>[1]): void {
  if (activeRouter) {
    activeRouter.goto(path, options);
  } else {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

export function getCurrentPath(): string {
  return activeRouter?.location?.pathname ?? window.location.pathname;
}
