import { LitElement, ReactiveElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { createAppRouter } from './router';
import { AuthStoreProvider, ProjectStoreProvider } from './state/controllers';

@customElement('app-root')
export class AppRoot extends LitElement {
  declare renderRoot: HTMLElement;

  private readonly authProvider = new AuthStoreProvider(this);
  private readonly projectProvider = new ProjectStoreProvider(this);
  private readonly router = createAppRouter(this);

  protected createRenderRoot(): HTMLElement {
    return this;
  }

  protected render() {
    return html`${this.router.outlet()}`;
  }
}
