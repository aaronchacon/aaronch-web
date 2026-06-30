import { isPlatformBrowser } from '@angular/common';
import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { Lang } from './language.types';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly transloco = inject(TranslocoService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly storageKey = 'lang';

  readonly active = signal<Lang>(this.readInitial());

  constructor() {
    effect(() => {
      const lang = this.active();
      this.transloco.setActiveLang(lang);
      if (!this.isBrowser) return;
      localStorage.setItem(this.storageKey, lang);
      document.documentElement.lang = lang;
    });
  }

  private readInitial(): Lang {
    if (!this.isBrowser) return 'en';

    const stored = localStorage.getItem(this.storageKey);
    if (stored === 'en' || stored === 'es') {
      return stored;
    }

    return 'en';
  }

  toggle(): void {
    this.active.update((lang) => (lang === 'en' ? 'es' : 'en'));
  }
}
