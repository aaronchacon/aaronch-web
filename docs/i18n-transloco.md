# Internationalization (i18n) with Transloco

How translations work in this project: the architecture, how it was configured, and how to use it.

## Why Transloco (and not Angular's built-in i18n)

Angular's built-in `@angular/localize` translates at **build time** and produces one separate build
per language. [Transloco](https://jsverse.github.io/transloco/) translates at **runtime**: a single
build, language switchable on the fly, and translations organized in JSON files. That fits a content
site with a language toggle, and plays well with signals.

## The big picture

Three pieces work together:

```
TranslocoBundledLoader   →  feeds translation JSON into Transloco (SSG-safe)
provideTransloco(...)     →  global config (available langs, default, fallback)
LanguageService           →  signal-based active language + persistence + <html lang>
```

Translations live in per-feature **scope** folders so no single file grows forever.

## File map

```
src/app/i18n/
  transloco-loader.ts        TranslocoBundledLoader — maps lang/scope paths to imported JSON
  language.service.ts        LanguageService — active-language signal, toggle, persistence
  language.types.ts          type Lang = 'en' | 'es'
  en.json / es.json          shared/global strings (footer, common labels…)
  coming-soon/
    en.json / es.json        scope "coming-soon" — only that feature's strings
src/app/app.config.ts        provideTransloco(...) registration
tsconfig.json                "resolveJsonModule": true  (lets us import .json)
```

## How it was configured

### 1. Loader — bundled, not HTTP (important for SSG)

Transloco's default loader fetches JSON over HTTP (`/i18n/en.json`). But this site is **prerendered
(SSG)**: at build time there is no server to serve those files, so an HTTP fetch would fail during
prerender. Instead we **import the JSON** so it is bundled and always available:

```ts
// src/app/i18n/transloco-loader.ts
import en from './en.json';
import comingSoonEn from './coming-soon/en.json';

const TRANSLATIONS: Record<string, Translation> = {
  en,
  es,
  'coming-soon/en': comingSoonEn,
  'coming-soon/es': comingSoonEs,
};

@Injectable({ providedIn: 'root' })
export class TranslocoBundledLoader implements TranslocoLoader {
  getTranslation(lang: string) {
    return of(TRANSLATIONS[lang]); // lang is "en" or a scoped "coming-soon/en"
  }
}
```

Trade-off: both languages ship in the JS bundle (a few KB). Fine for a couple of small locales; if it
ever grows large, switch to lazy HTTP loading with a platform-aware loader.

### 2. Global registration

```ts
// src/app/app.config.ts
provideTransloco({
  config: {
    availableLangs: ['en', 'es'],
    defaultLang: 'en',
    fallbackLang: 'en',
    reRenderOnLangChange: true, // re-render the view when the language changes (needed for the toggle)
    prodMode: !isDevMode(),
  },
  loader: TranslocoBundledLoader,
});
```

No `provideHttpClient` is needed because the loader does not use HTTP.

### 3. LanguageService — the active language as a signal

Mirrors `ThemeService`: a signal holds the active language; an `effect` syncs it to Transloco,
`localStorage`, and the `<html lang>` attribute. Browser-only side effects are guarded for SSR.

```ts
readonly active = signal<Lang>(this.readInitial());

constructor() {
  effect(() => {
    const lang = this.active();
    this.transloco.setActiveLang(lang);
    if (!this.isBrowser) return;          // no localStorage/document during prerender
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang; // a11y + SEO
  });
}

toggle() { this.active.update((l) => (l === 'en' ? 'es' : 'en')); }
```

## How to use it in a component

```ts
@Component({
  imports: [TranslocoDirective], // 1. import the directive
  providers: [provideTranslocoScope('coming-soon')], // 2. declare which scope this component loads
})
export class ComingSoon {
  protected readonly language = inject(LanguageService);
}
```

```html
<!-- 3. open a scope; `t` is a TRANSLATE FUNCTION, not an object -->
<section *transloco="let t; read: 'comingSoon'">
  {{ t('status') }} {{ t('message') }}
  <a [href]="t('cvUrl')">{{ t('cvLabel') }}</a>
</section>

<!-- toggle the language -->
<button (click)="language.toggle()">{{ language.active() === 'en' ? 'ES' : 'EN' }}</button>
```

Note: the scope folder `coming-soon` is namespaced as **`comingSoon`** (Transloco camelCases scope
names), which is why `read: 'comingSoon'`.

## Cookbook

**Add a string to an existing scope** — add the same key to `coming-soon/en.json` and
`coming-soon/es.json`, then use `t('newKey')`.

**Add a new feature scope** (e.g. `home`):

1. Create `src/app/i18n/home/en.json` and `home/es.json`.
2. Register both in the loader's `TRANSLATIONS` map (2 lines).
3. In the component: `providers: [provideTranslocoScope('home')]`, import `TranslocoDirective`,
   and `*transloco="let t; read: 'home'"`.

**Add a new language** (e.g. `pt`):

1. Add `'pt'` to `availableLangs` in `app.config.ts`.
2. Add `pt.json` for every scope (and the shared root) and register them in the loader.
3. Add `'pt'` to the `Lang` type and extend `LanguageService.toggle()` if needed.

## Things to remember (gotchas)

- **`t` is a function**: call `t('key')`. Not `t.key`, not `t().key`.
- **Bundled loader**: every scope must be registered in `transloco-loader.ts`. This is what makes
  translations available during SSG prerendering.
- **`resolveJsonModule: true`** in `tsconfig.json` is required to import `.json` files.
- **Scope names are camelCased** for `read:` (`coming-soon` → `comingSoon`).
- Translated content is rendered into the **prerendered HTML** in the default language, so search
  engines see real text, not empty placeholders.

## Not done yet

Locale-prefixed routes (`/es`, `/en`) prerendered separately for SEO. That will be added when the
site becomes multi-page; for a single-route holding page, the runtime toggle is enough.
