import { Directive, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'ghost';

@Directive({
  selector: 'a[appButton], button[appButton]',
  host: {
    class: 'app-btn',
    '[class.app-btn--primary]': "variant() === 'primary'",
    '[class.app-btn--ghost]': "variant() === 'ghost'",
  },
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
}
