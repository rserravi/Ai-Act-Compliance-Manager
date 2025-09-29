import { ContextConsumer, ContextProvider, type Context } from '@lit-labs/context';
import type { ReactiveController, ReactiveElement } from '@lit/reactive-element';
import { authStore, type AuthStore } from './auth-store';
import { projectStore, type ProjectStore } from './project-store';
import { authStoreContext, projectStoreContext } from './context';

function combineSubscriptions(subscriptions: Array<() => void>): () => void {
  return () => {
    for (const unsubscribe of subscriptions) {
      unsubscribe();
    }
    subscriptions.length = 0;
  };
}

class BaseStoreController<TStore> implements ReactiveController {
  protected readonly host: ReactiveElement;
  protected store: TStore;
  private unsubscribe: () => void = () => {};
  private readonly contextConsumer?: ContextConsumer<Context<TStore>, ReactiveElement>;

  constructor(host: ReactiveElement, options: { store: TStore; context?: Context<TStore> }) {
    this.host = host;
    this.store = options.store;

    if (options.context) {
      this.contextConsumer = new ContextConsumer(host, {
        context: options.context,
        subscribe: true,
        callback: (value) => {
          if (value) {
            this.#attachStore(value as TStore);
          }
        }
      });
    }

    host.addController(this);
  }

  protected createSubscription(_store: TStore): () => void {
    return () => {};
  }

  hostConnected(): void {
    this.contextConsumer?.hostConnected?.();
    this.unsubscribe();
    this.unsubscribe = this.createSubscription(this.store);
  }

  hostDisconnected(): void {
    this.unsubscribe();
    this.contextConsumer?.hostDisconnected?.();
  }

  #attachStore(store: TStore): void {
    if (this.store === store) {
      return;
    }
    this.unsubscribe();
    this.store = store;
    this.unsubscribe = this.createSubscription(store);
    this.host.requestUpdate();
  }
}

export class AuthController extends BaseStoreController<AuthStore> {
  constructor(host: ReactiveElement, store: AuthStore = authStore) {
    super(host, { store, context: authStoreContext });
  }

  protected override createSubscription(store: AuthStore): () => void {
    const subscriptions = [
      store.user.subscribe(() => this.host.requestUpdate()),
      store.token.subscribe(() => this.host.requestUpdate()),
      store.isAuthenticating.subscribe(() => this.host.requestUpdate()),
      store.isRestoringSession.subscribe(() => this.host.requestUpdate())
    ];
    void store.ensureSessionRestored();
    return combineSubscriptions(subscriptions);
  }

  get value(): AuthStore {
    return this.store;
  }

  get user() {
    return this.store.user.value;
  }

  get token() {
    return this.store.token.value;
  }

  get isAuthenticating() {
    return this.store.isAuthenticating.value;
  }

  get isRestoringSession() {
    return this.store.isRestoringSession.value;
  }

  get isAuthenticated() {
    return this.store.isAuthenticated;
  }
}

export class ProjectController extends BaseStoreController<ProjectStore> {
  constructor(host: ReactiveElement, store: ProjectStore = projectStore) {
    super(host, { store, context: projectStoreContext });
  }

  protected override createSubscription(store: ProjectStore): () => void {
    const subscriptions = [
      store.projects.subscribe(() => this.host.requestUpdate()),
      store.documents.subscribe(() => this.host.requestUpdate()),
      store.tasks.subscribe(() => this.host.requestUpdate()),
      store.activeProjectId.subscribe(() => this.host.requestUpdate()),
      store.activeProject.subscribe(() => this.host.requestUpdate())
    ];
    return combineSubscriptions(subscriptions);
  }

  get value(): ProjectStore {
    return this.store;
  }

  get projects() {
    return this.store.projects.value;
  }

  get documents() {
    return this.store.documents.value;
  }

  get tasks() {
    return this.store.tasks.value;
  }

  get activeProjectId() {
    return this.store.activeProjectId.value;
  }

  get activeProject() {
    return this.store.activeProject.value;
  }
}

export class AuthStoreProvider extends ContextProvider<typeof authStoreContext> {
  constructor(host: ReactiveElement, store: AuthStore = authStore) {
    super(host, { context: authStoreContext, initialValue: store });
  }
}

export class ProjectStoreProvider extends ContextProvider<typeof projectStoreContext> {
  constructor(host: ReactiveElement, store: ProjectStore = projectStore) {
    super(host, { context: projectStoreContext, initialValue: store });
  }
}
