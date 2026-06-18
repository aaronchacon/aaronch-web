import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ThemeService } from '../../core/theme/theme.service';

type Lang = 'en' | 'es';

// Lean, local "poor man's i18n" for this temporary page.
// Full i18n (Transloco) arrives in Phase 2; no global service needed yet.
const CONTENT = {
  en: {
    status: 'Available for B2B projects',
    role: 'Senior Frontend Engineer · Angular',
    message:
      "I'm rebuilding my portfolio from the ground up — in Angular, of course. The full site lands soon. In the meantime, let's connect or check out my CV.",
    cvLabel: 'View CV',
    cvUrl: '/cvs/Aaron_Chacon_CV_EN.pdf',
    next: 'ES',
  },
  es: {
    status: 'Disponible para proyectos B2B',
    role: 'Ingeniero Frontend Senior · Angular',
    message:
      'Estoy reconstruyendo mi portfolio desde cero (en Angular, cómo no). Pronto estará completo. Mientras tanto, conectemos o echa un vistazo a mi CV.',
    cvLabel: 'Ver CV',
    cvUrl: '/cvs/Aaron_Chacon_CV_ES.pdf',
    next: 'EN',
  },
} as const;

@Component({
  selector: 'app-coming-soon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './coming-soon.html',
  styleUrl: './coming-soon.scss',
})
export class ComingSoon {
  protected readonly theme = inject(ThemeService);

  protected readonly lang = signal<Lang>('en');
  protected readonly t = computed(() => CONTENT[this.lang()]);

  protected toggleLang(): void {
    this.lang.update((current) => (current === 'en' ? 'es' : 'en'));
  }
}
