import { Component, model } from '@angular/core';

@Component({
  selector: 'app-sort-dropdown',
  standalone: true,
  template: `
    <div class="sort-dropdown">
      <span class="sort-label">Sort by:</span>
      <select class="sort-select" [value]="sortBy()" (change)="onSort($event)" id="sort-select">
        <option value="recommended">Recommended</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="newest">Newest</option>
        <option value="name">Name A-Z</option>
      </select>
      <span class="material-symbols-outlined sort-icon">swap_vert</span>
    </div>
  `,
  styles: [`
    .sort-dropdown {
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
    }

    .sort-label {
      font-size: 0.8rem;
      color: var(--text-light);
      font-weight: 500;
    }

    .sort-select {
      border: none;
      background: transparent;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-primary);
      cursor: pointer;
      padding: 4px 0;
      -webkit-appearance: none;
      appearance: none;
    }

    .sort-icon {
      font-size: 18px;
      color: var(--text-secondary);
    }
  `]
})
export class SortDropdownComponent {
  sortBy = model<string>('recommended');

  onSort(event: Event) {
    this.sortBy.set((event.target as HTMLSelectElement).value);
  }
}
