import { Injectable, inject, signal, computed } from '@angular/core';
import { LanguageService } from './language';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private langService = inject(LanguageService);

  // Configurable exchange rate (1 USD = X BRL)
  // Initial default rate: R$ 5,65 per USD
  private readonly usdExchangeRate = signal<number>(5.65);

  /**
   * Structure ready for future live exchange rate API integration (e.g. AwesomeAPI / Exchangerate-api).
   * Automatically falls back to the configured constant if API is unreachable.
   */
  async updateLiveExchangeRate(): Promise<void> {
    try {
      const response = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL');
      if (response.ok) {
        const data = await response.json();
        if (data?.USDBRL?.bid) {
          const rate = parseFloat(data.USDBRL.bid);
          if (rate > 0) {
            this.usdExchangeRate.set(rate);
          }
        }
      }
    } catch {
      // Graceful fallback to initial configurable rate constant
    }
  }

  getExchangeRate(): number {
    return this.usdExchangeRate();
  }

  setExchangeRate(rate: number) {
    if (rate > 0) {
      this.usdExchangeRate.set(rate);
    }
  }

  /**
   * Formats BRL amount dynamically based on active language:
   * PT-BR -> R$ 1.234,56
   * EN-US -> $1,234.56 (converted using USD exchange rate)
   */
  format(amountInBrl: number | null | undefined): string {
    if (amountInBrl == null || isNaN(amountInBrl)) return '';

    const lang = this.langService.currentLang();
    const rate = this.usdExchangeRate();

    if (lang === 'en') {
      const amountInUsd = amountInBrl / rate;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amountInUsd);
    } else {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amountInBrl);
    }
  }

  /**
   * Returns current currency symbol ('R$' for PT, '$' for EN)
   */
  readonly symbol = computed(() => (this.langService.currentLang() === 'en' ? '$' : 'R$'));
}
