import { environment } from '../../environments/environment';

export const firebaseConfig = environment.firebase;

export function isFirebaseConfigured(cfg = firebaseConfig): boolean {
  return !Object.values(cfg).some((v) => typeof v === 'string' && v.startsWith('YOUR_'));
}
