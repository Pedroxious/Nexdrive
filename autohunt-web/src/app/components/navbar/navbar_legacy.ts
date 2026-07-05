import { Component, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule],
    template: `
    <nav class="navbar glass">
      <!-- Minimal for quick fix, will full implementation next if needed -->
    </nav>
  `,
    styles: [``]
})
export class NavbarComponent {
    // Fix for build errors if any exports are missing
}
