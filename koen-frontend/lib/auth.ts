import { UserSession, AppConfig } from '@stacks/connect';

// Only create userSession on client side to avoid SSR issues
let userSession: UserSession;

if (typeof window !== 'undefined') {
  const appConfig = new AppConfig(['store_write', 'publish_data']);
  userSession = new UserSession({ appConfig });
}

export { userSession };
