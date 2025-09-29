import { createContext } from '@lit/context';
import type { AuthStore } from './auth-store';
import type { ProjectStore } from './project-store';

export const authStoreContext = createContext<AuthStore>(Symbol.for('aacm/auth-store'));
export const projectStoreContext = createContext<ProjectStore>(Symbol.for('aacm/project-store'));
