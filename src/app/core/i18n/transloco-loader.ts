import { Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { of } from 'rxjs';
import en from '../../../i18n/en.json';
import es from '../../../i18n/es.json';
import comingSoonEn from '../../../i18n/coming-soon/en.json';
import comingSoonEs from '../../../i18n/coming-soon/es.json';

// Translations are bundled (imported), not fetched over HTTP, so they're available
// during SSG prerendering, where no server is running to serve the JSON files.
//
// Transloco asks for either a root lang ("en") or a scoped path ("coming-soon/en").
// Each feature gets its own scope folder; register it here (2 lines per feature).
const TRANSLATIONS: Record<string, Translation> = {
  en,
  es,
  'coming-soon/en': comingSoonEn,
  'coming-soon/es': comingSoonEs,
};

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  getTranslation(lang: string) {
    return of(TRANSLATIONS[lang]);
  }
}
