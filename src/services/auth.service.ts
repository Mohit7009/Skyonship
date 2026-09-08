import type {
  IAuthService,
  LoginCredentials,
  SignupPayload,
  AuthResponse,
  AuthUser,
} from '../types/auth';

/**
 * AuthService Boundary
 * Provides clean decoupled interface contract for future backend authentication provider.
 */
export class AuthService implements IAuthService {
  async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulated UI boundary contract stub
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            id: 'usr-demo-001',
            fullName: 'Merchant Administrator',
            workEmail: credentials.workEmail,
            role: 'customer',
            businessName: 'Global Shipping Merchant',
          },
          token: 'demo-session-token-placeholder',
          message: 'UI authentication boundary stub.',
        });
      }, 1000);
    });
  }

  async signUp(payload: SignupPayload): Promise<AuthResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            id: 'usr-new-002',
            fullName: payload.fullName,
            workEmail: payload.workEmail,
            role: 'customer',
            businessName: payload.businessName,
            phoneNumber: payload.phoneNumber,
            businessType: payload.businessType,
          },
          token: 'demo-session-token-placeholder',
          message: 'Merchant account registration UI boundary stub.',
        });
      }, 1200);
    });
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: `Password reset link simulated for ${email}. Check inbox.`,
        });
      }, 1000);
    });
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return null;
  }

  async signOut(): Promise<void> {
    return Promise.resolve();
  }
}

export const authService = new AuthService();
