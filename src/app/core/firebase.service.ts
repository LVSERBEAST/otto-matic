import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Client } from './models/client.model';
import { Job, Quote } from '../features/quotes/models/job.model';
import { firebaseConfig, isFirebaseConfigured } from './firebase.config';

// Firebase SDK imports (modular v9+)
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { Analytics, getAnalytics } from 'firebase/analytics';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private app?: FirebaseApp;
  private analytics?: Analytics;
  private configured = isFirebaseConfigured();

  constructor() {
    if (this.configured && getApps().length === 0) {
      this.app = initializeApp(firebaseConfig);
      this.analytics = getAnalytics(this.app); // add later
    } else if (this.configured) {
      this.app = getApps()[0]!;
    }
  }

  private isAuthed(): boolean {
    if (!this.app) return false;
    try {
      const auth = getAuth(this.app);
      return !!auth.currentUser;
    } catch {
      return false;
    }
  }

  // Expose whether Firestore is configured and a user is authenticated
  isDbActive(): boolean {
    return !!this.app && this.configured && this.isAuthed();
  }

  fetchClients(): Observable<Client[]> {
    if (!this.configured || !this.app || !this.isAuthed()) {
      return of([]);
    }
    const db = getFirestore(this.app);
    const ref = collection(db, 'clients');
    return from(getDocs(ref)).pipe(
      map((snap) =>
        snap.docs.map(
          (d: QueryDocumentSnapshot<DocumentData>) =>
            ({ id: d.id, ...(d.data() as Omit<Client, 'id'>) } as Client)
        )
      ),
      catchError(() => of([]))
    );
  }

  streamClients(): Observable<Client[]> {
    if (!this.configured || !this.app || !this.isAuthed()) {
      return this.fetchClients();
    }
    const db = getFirestore(this.app);
    const ref = collection(db, 'clients');
    const q = query(ref, orderBy('name'));
    return new Observable<Client[]>((subscriber) => {
      const unsub = onSnapshot(q, {
        next: (snap) => {
          const data = snap.docs.map(
            (d) => ({ id: d.id, ...(d.data() as Omit<Client, 'id'>) } as Client)
          );
          subscriber.next(data);
        },
        error: () => {
          subscriber.next([]);
          subscriber.complete();
        },
      });
      return () => unsub();
    });
  }

  createClient(data: Omit<Client, 'id'>): Observable<Client> {
    if (!this.configured || !this.app || !this.isAuthed()) {
      return of();
    }
    const db = getFirestore(this.app);
    const ref = collection(db, 'clients');
    return from(addDoc(ref, { ...data, createdAt: serverTimestamp() })).pipe(
      map((docRef) => ({ id: docRef.id, ...data } as Client))
    );
  }

  updateClient(client: Client): Observable<boolean> {
    if (!this.configured || !this.app || !this.isAuthed()) return of(true);
    const db = getFirestore(this.app);
    const { id, ...rest } = client;
    const ref = doc(db, 'clients', id);
    return from(updateDoc(ref, { ...rest })).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  deleteClient(clientId: string): Observable<boolean> {
    if (!this.configured || !this.app || !this.isAuthed()) return of(true);
    const db = getFirestore(this.app);
    const ref = doc(db, 'clients', clientId);
    return from(deleteDoc(ref)).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  // Placeholder: simulate saving a quote
  saveQuote(quote: Quote): Observable<boolean> {
    if (!this.configured || !this.app || !this.isAuthed()) {
      return of(true);
    }
    const db = getFirestore(this.app);
    const ref = doc(db, 'quotes', quote.quoteId);
    const payload = { ...quote, createdAt: serverTimestamp() };
    return from(setDoc(ref, payload)).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  fetchQuotes(): Observable<Job[]> {
    if (!this.configured || !this.app || !this.isAuthed()) {
      return of([]);
    }
    const db = getFirestore(this.app);
    const ref = collection(db, 'quotes');
    const q = query(ref, orderBy('createdAt', 'desc'));
    return from(getDocs(q)).pipe(
      map((snap) => snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => d.data() as Job)),
      catchError(() => of([] as Job[]))
    );
  }

  streamQuotes(): Observable<Quote[]> {
    if (!this.configured || !this.app || !this.isAuthed()) {
      return of([]);
    }
    const db = getFirestore(this.app);
    const ref = collection(db, 'quotes');
    const q = query(ref, orderBy('createdAt', 'desc'));
    return new Observable<Quote[]>((subscriber) => {
      const unsub = onSnapshot(q, {
        next: (snap) => {
          const data = snap.docs.map((d) => d.data() as Quote);
          subscriber.next(data);
        },
        error: () => {
          subscriber.next([]);
          subscriber.complete();
        },
      });
      return () => unsub();
    });
  }

  updateQuote(quote: Quote): Observable<boolean> {
    if (!this.configured || !this.app || !this.isAuthed()) return of(true);
    const db = getFirestore(this.app);
    const ref = doc(db, 'quotes', quote.quoteId);
    const { quoteId, ...rest } = quote;
    return from(updateDoc(ref, { ...rest })).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  deleteQuote(quoteId: string): Observable<boolean> {
    if (!this.configured || !this.app || !this.isAuthed()) return of(true);
    const db = getFirestore(this.app);
    const ref = doc(db, 'quotes', quoteId);
    return from(deleteDoc(ref)).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  // Auth API
  signInWithGoogle(): Observable<FirebaseUser> {
    if (!this.configured || !this.app) {
      return of({} as unknown as FirebaseUser);
    }
    const auth = getAuth(this.app);
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(auth, provider)).pipe(map((cred) => cred.user));
  }

  signOut(): Observable<void> {
    if (!this.configured || !this.app) return of(void 0);
    const auth = getAuth(this.app);
    return from(signOut(auth));
  }

  // Email/password auth
  signInWithEmailPassword(email: string, password: string): Observable<FirebaseUser> {
    if (!this.configured || !this.app) {
      return from(Promise.reject({ code: 'auth/config-missing' }));
    }
    const auth = getAuth(this.app);
    return from(signInWithEmailAndPassword(auth, email, password)).pipe(map((cred) => cred.user));
  }

  registerWithEmailPassword(email: string, password: string): Observable<FirebaseUser> {
    if (!this.configured || !this.app) {
      return from(Promise.reject({ code: 'auth/config-missing' }));
    }
    const auth = getAuth(this.app);
    return from(createUserWithEmailAndPassword(auth, email, password)).pipe(
      map((cred) => cred.user)
    );
  }

  onAuthState(cb: (user: FirebaseUser | null) => void): void {
    if (!this.configured || !this.app) {
      cb(null);
      return;
    }
    const auth = getAuth(this.app);
    onAuthStateChanged(auth, cb);
  }
}
