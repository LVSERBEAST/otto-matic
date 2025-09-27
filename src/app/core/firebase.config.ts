export const firebaseConfig = {
  apiKey: 'AIzaSyCnDcMluuTSL8AuB1Qj8tRibRywpriQWzQ',
  authDomain: 'ottonewport.firebaseapp.com',
  projectId: 'ottonewport',
  storageBucket: 'ottonewport.firebasestorage.app',
  messagingSenderId: '594092256353',
  appId: '1:594092256353:web:0a5cfc47a209277e760e20',
  measurementId: 'G-LEEV91RF90',
};

export function isFirebaseConfigured(cfg = firebaseConfig): boolean {
  return !Object.values(cfg).some((v) => typeof v === 'string' && v.startsWith('YOUR_'));
}
