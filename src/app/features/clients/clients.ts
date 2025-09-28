import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClientsService } from './clients.service';
import { ClientForm } from './components/client-form/client-form';
import { Client } from '../../core/models/client.model';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, ClientForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './clients.html',
})
export class Clients {
  private readonly clientsService = inject(ClientsService);
  private readonly router = inject(Router);

  readonly clients = this.clientsService.clients;
  readonly error = this.clientsService.error;

  readonly stats = computed(() => {
    const allClients = this.clients();
    const taxExempt = allClients.filter(c => c.isTaxExempt).length;
    const avgDiscount = allClients.length > 0 
      ? allClients.reduce((sum, c) => sum + c.defaultDiscountRate, 0) / allClients.length 
      : 0;

    return {
      totalClients: allClients.length,
      activeClients: allClients.length, // Could add logic for "active" determination
      taxExemptCount: taxExempt,
      avgDiscount,
    };
  });

  createClient(value: any) {
    const client: Omit<Client, 'id'> = {
      name: value.name,
      email: value.email,
      phone: value.phone,
      website: value.website || '',
      street: value.street || '',
      city: value.city || '',
      state: value.state || '',
      zip: value.zip || '',
      isTaxExempt: value.isTaxExempt || false,
      defaultDiscountRate: value.defaultDiscountRate || 0,
      notes: value.notes || '',
    };

    this.clientsService.create(client);
  }

  editClient(client: Client) {
    console.log('Edit client:', client.id);
  }

  viewClientJobs(client: Client) {
    this.router.navigate(['/admin/jobs'], { queryParams: { clientId: client.id } });
  }

  deleteClient(clientId: string) {
    this.clientsService.delete(clientId);
  }

  filterClients(filterType: string) {
    console.log('Filter clients:', filterType);
  }

  getActiveClients(): number {
    return this.clients().length; // Could add logic for determining "active" clients
  }

  getTaxExemptCount(): number {
    return this.clients().filter(c => c.isTaxExempt).length;
  }

  getAvgDiscount(): number {
    const clients = this.clients();
    return clients.length > 0 
      ? clients.reduce((sum, c) => sum + c.defaultDiscountRate, 0) / clients.length 
      : 0;
  }

  getRecentClients(): Client[] {
    return [...this.clients()].slice(0, 10); // Could add date sorting if createdAt field exists
  }
}
