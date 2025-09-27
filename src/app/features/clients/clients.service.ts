import { Injectable, computed, inject, signal } from '@angular/core';
import { FirebaseService } from '../../core/firebase.service';
import { Client } from '../../core/models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private readonly fb = inject(FirebaseService);

  private readonly clientsSignal = signal<ReadonlyArray<Client>>([]);
  readonly clients = computed(() => this.clientsSignal());

  private readonly errorSignal = signal<string | null>(null);
  readonly error = computed(() => this.errorSignal());

  constructor() {
    this.fb.streamClients().subscribe((list) => this.clientsSignal.set(list));
  }

  create(data: Omit<Client, 'id'>) {
    this.errorSignal.set(null);
    this.fb.createClient(data).subscribe({
      next: (created) => {
        // Optimistic/local update so it works in mock mode too
        this.clientsSignal.set([...this.clientsSignal(), created]);
      },
      error: (e: unknown) => {
        const code = (e as { code?: string; message?: string }).code ?? 'unknown-error';
        const msg = (e as { code?: string; message?: string }).message ?? 'Save failed.';
        this.errorSignal.set(`Could not save client (${code}). ${msg}`);
      },
    });
  }

  update(client: Client) {
    this.errorSignal.set(null);
    this.fb.updateClient(client).subscribe({
      next: () => {
        const next = this.clientsSignal().map((c) => (c.id === client.id ? { ...client } : c));
        this.clientsSignal.set(next);
      },
      error: (e: unknown) => {
        const code = (e as { code?: string; message?: string }).code ?? 'unknown-error';
        const msg = (e as { code?: string; message?: string }).message ?? 'Update failed.';
        this.errorSignal.set(`Could not update client (${code}). ${msg}`);
      },
    });
  }

  delete(id: string) {
    this.errorSignal.set(null);
    this.fb.deleteClient(id).subscribe({
      next: () => {
        this.clientsSignal.set(this.clientsSignal().filter((c) => c.id !== id));
      },
      error: (e: unknown) => {
        const code = (e as { code?: string; message?: string }).code ?? 'unknown-error';
        const msg = (e as { code?: string; message?: string }).message ?? 'Delete failed.';
        this.errorSignal.set(`Could not delete client (${code}). ${msg}`);
      },
    });
  }
}
