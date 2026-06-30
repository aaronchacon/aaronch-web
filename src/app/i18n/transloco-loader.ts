import en from './en.json';
import es from './es.json';

import comingSoonEn from './coming-soon/en.json';
import comingSoonEs from './coming-soon/es.json';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { Translation, TranslocoLoader } from '@jsverse/transloco';

// Transloco asks for either a root lang ("en") or a scoped path ("coming-soon/en").
// Each feature gets its own scope folder; register it here (2 lines per feature).
const TRANSLATIONS: Record<string, Translation> = {
  en,
  es,
  'coming-soon/en': comingSoonEn,
  'coming-soon/es': comingSoonEs,
};

@Injectable({ providedIn: 'root' })
export class TranslocoBundledLoader implements TranslocoLoader {
  getTranslation(lang: string) {
    return of(TRANSLATIONS[lang]);
  }
}
