import { createContext } from '@lit-labs/context';
import type { ReactiveElement } from 'lit';
import type { AuthStore } from './auth-store';
import type { ProjectStore } from './project-store';

export const authStoreContext = createContext<AuthStore, ReactiveElement>(Symbol.for('aacm/auth-store'));
export const projectStoreContext = createContext<ProjectStore, ReactiveElement>(Symbol.for('aacm/project-store'));
