import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '../../core/theme/theme.service';
import { Button } from '../../shared/ui/button/button';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import { LanguageService } from '../../i18n/language.service';

@Component({
  selector: 'app-coming-soon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './coming-soon.html',
  styleUrl: './coming-soon.scss',
  imports: [Button, TranslocoDirective],
  providers: [provideTranslocoScope('coming-soon')],
})
export class ComingSoon {
  protected readonly theme = inject(ThemeService);
  protected readonly language = inject(LanguageService);
}
