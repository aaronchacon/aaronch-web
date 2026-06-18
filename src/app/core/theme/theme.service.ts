import { isPlatformBrowser } from '@angular/common';
import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { ThemePreference } from './theme.types';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'theme';
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly preference = signal<ThemePreference>(this.readInitial());

  constructor() {
    effect(() => {
      const pref = this.preference();
      if (!this.isBrowser) return;
      localStorage.setItem(this.storageKey, pref);
      if (pref === 'system') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', pref);
      }
    });
  }

  private readInitial(): ThemePreference {
    if (!this.isBrowser) return 'system';

    const stored = localStorage.getItem(this.storageKey);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }

    return 'system';
  }

  toggle(): void {
    this.preference.update((current) => (current === 'dark' ? 'light' : 'dark'));
  }
}
