import { LitElement } from 'lit';
import type { SupportedLanguage } from './i18n';
import { getCurrentLanguage, onLanguageChanged } from './i18n';

/**
 * Base LitElement que reactualiza la vista cuando cambia el idioma activo.
 */
export class LocalizedElement extends LitElement {
  protected currentLanguage: SupportedLanguage = getCurrentLanguage();
  private unsubscribeLanguageChange: (() => void) | null = null;

  connectedCallback(): void {
    super.connectedCallback();
    this.currentLanguage = getCurrentLanguage();
    this.unsubscribeLanguageChange = onLanguageChanged((language) => {
      this.currentLanguage = language;
      this.handleLanguageChanged(language);
      this.requestUpdate();
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unsubscribeLanguageChange?.();
    this.unsubscribeLanguageChange = null;
  }

  // Permite que las subclases reaccionen al cambio de idioma antes de re-renderizar.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected handleLanguageChanged(_language: SupportedLanguage): void {
    // noop por defecto, las subclases pueden sobreescribirlo
  }
}
