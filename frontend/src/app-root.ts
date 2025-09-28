import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('app-root')
export class AppRoot extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  protected render() {
    return html`
      <main class="min-h-screen flex items-center justify-center bg-base-200 text-base-content">
        <section class="text-center space-y-4">
          <h1 class="text-3xl font-bold">AI Act Compliance Manager</h1>
          <p class="text-lg">Frontend migration to Lit is in progress.</p>
        </section>
      </main>
    `;
  }
}
