import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { QuotesService } from '../quotes/quotes.service';
import { ClientsService } from '../clients/clients.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly quotesService = inject(QuotesService);
  private readonly clientsService = inject(ClientsService);
  private readonly auth = inject(AuthService);

  readonly quotes = this.quotesService.quotes;
  readonly clients = this.clientsService.clients;
  readonly user = this.auth.user;

  readonly stats = computed(() => {
    const allQuotes = this.quotes();
    const totalValue = allQuotes.reduce((sum, q) => sum + q.totalPrice, 0);
    const draftCount = allQuotes.filter((q) => q.status === 'Draft').length;
    const approvedCount = allQuotes.filter((q) => q.status === 'Approved').length;
    const sentCount = allQuotes.filter((q) => q.status === 'Sent').length;

    return {
      totalQuotes: allQuotes.length,
      totalValue,
      totalClients: this.clients().length,
      avgQuoteValue: allQuotes.length > 0 ? totalValue / allQuotes.length : 0,
      drafts: draftCount,
      approved: approvedCount,
      sent: sentCount,
    };
  });

  readonly recentQuotes = computed(() =>
    [...this.quotes()]
      .sort((a, b) => new Date(b.quoteDate).getTime() - new Date(a.quoteDate).getTime())
      .slice(0, 6)
  );

  readonly topClients = computed(() => this.clients().slice(0, 5));

  getClientInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
