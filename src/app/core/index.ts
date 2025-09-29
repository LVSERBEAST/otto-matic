// Core Services Public API
export { BaseFirestoreService } from './services/base-firestore.service';
export { ErrorHandlerService } from './services/error-handler.service';
export { StatsService } from './services/stats.service';

// Models
export * from './models/client.model';
export * from './models/job.model';
export * from './models/quote.model';
export * from './models/user.model';

// Services
export { AuthService } from './auth.service';
export { FirebaseService } from './firebase.service';

// Guards
export { authGuard } from './guards/auth.guard';
export { adminGuard } from './guards/admin.guard';
