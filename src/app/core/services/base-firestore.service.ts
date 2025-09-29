import { Injectable, inject } from '@angular/core';
import { Observable, from, of, catchError } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy as firestoreOrderBy,
  onSnapshot,
  Timestamp,
  getFirestore
} from 'firebase/firestore';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class BaseFirestoreService {
  private readonly errorHandler = inject(ErrorHandlerService);

  /**
   * Generic method to fetch all documents from a collection
   */
  protected fetchCollection<T>(
    collectionName: string, 
    orderByField?: string,
    orderDirection: 'asc' | 'desc' = 'desc'
  ): Observable<T[]> {
    try {
      const db = getFirestore();
      const collectionRef = collection(db, collectionName);
      
      const q = orderByField 
        ? query(collectionRef, firestoreOrderBy(orderByField, orderDirection))
        : collectionRef;
      
      return from(getDocs(q)).pipe(
        map(snapshot => 
          snapshot.docs.map((doc: any) => ({ 
            id: doc.id, 
            ...this.convertFirebaseData(doc.data()) 
          } as T))
        ),
        catchError(this.errorHandler.handleErrorSafely<T[]>([]))
      );
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      return of([]);
    }
  }

  /**
   * Generic method to stream real-time updates from a collection
   */
  protected streamCollection<T>(
    collectionName: string,
    orderByField?: string,
    orderDirection: 'asc' | 'desc' = 'desc'
  ): Observable<T[]> {
    return new Observable<T[]>(observer => {
      try {
        const db = getFirestore();
        const collectionRef = collection(db, collectionName);
        
        const q = orderByField 
          ? query(collectionRef, firestoreOrderBy(orderByField, orderDirection))
          : collectionRef;
        
        const unsubscribe = onSnapshot(q, 
          snapshot => {
            const data = snapshot.docs.map((doc: any) => ({
              id: doc.id,
              ...this.convertFirebaseData(doc.data())
            })) as T[];
            observer.next(data);
          },
          error => {
            console.error(`Error streaming ${collectionName}:`, error);
            observer.next([]);
          }
        );
        
        return () => unsubscribe();
      } catch (error) {
        console.error(`Error setting up ${collectionName} stream:`, error);
        observer.next([]);
        observer.complete();
        return () => {};
      }
    });
  }

  /**
   * Generic method to create a document
   */
  protected createDocument<T extends Record<string, any>>(
    collectionName: string, 
    data: T
  ): Observable<string> {
    const db = getFirestore();
    const collectionRef = collection(db, collectionName);
    
    return from(addDoc(collectionRef, {
      ...data,
      createdAt: new Date()
    })).pipe(
      map(docRef => docRef.id),
      catchError(error => {
        const message = this.errorHandler.handleApiError(error, `Create ${collectionName}`);
        throw new Error(message);
      })
    );
  }

  /**
   * Generic method to set a document with a specific ID
   */
  protected setDocument<T extends Record<string, any>>(
    collectionName: string, 
    documentId: string,
    data: T
  ): Observable<void> {
    const db = getFirestore();
    const docRef = doc(db, collectionName, documentId);
    
    return from(setDoc(docRef, {
      ...data,
      createdAt: new Date()
    })).pipe(
      catchError(error => {
        const message = this.errorHandler.handleApiError(error, `Set ${collectionName}`);
        throw new Error(message);
      })
    );
  }

  /**
   * Generic method to update a document
   */
  protected updateDocument<T extends Record<string, any>>(
    collectionName: string, 
    documentId: string, 
    data: Partial<T>
  ): Observable<void> {
    const db = getFirestore();
    const docRef = doc(db, collectionName, documentId);
    
    return from(updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    })).pipe(
      catchError(error => {
        const message = this.errorHandler.handleApiError(error, `Update ${collectionName}`);
        throw new Error(message);
      })
    );
  }

  /**
   * Generic method to delete a document
   */
  protected deleteDocument(collectionName: string, documentId: string): Observable<void> {
    const db = getFirestore();
    const docRef = doc(db, collectionName, documentId);
    
    return from(deleteDoc(docRef)).pipe(
      catchError(error => {
        const message = this.errorHandler.handleApiError(error, `Delete ${collectionName}`);
        throw new Error(message);
      })
    );
  }

  /**
   * Convert Firebase Timestamps to JavaScript Dates
   */
  private convertFirebaseData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (data instanceof Timestamp) {
      return data.toDate();
    }

    if (Array.isArray(data)) {
      return data.map(item => this.convertFirebaseData(item));
    }

    if (typeof data === 'object') {
      const converted: any = {};
      for (const [key, value] of Object.entries(data)) {
        converted[key] = this.convertFirebaseData(value);
      }
      return converted;
    }

    return data;
  }
}
