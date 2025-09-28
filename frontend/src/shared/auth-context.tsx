/**
 * Legacy re-exports for auth/project context utilities.
 *
 * The previous React-based implementation lived in this module and external
 * consumers may still import from it. We now expose the Lit-based stores and
 * controllers so the TypeScript compiler can resolve the module without
 * pulling React in as a dependency.
 */
export {
  AuthController,
  AuthStoreProvider,
  ProjectController,
  ProjectStoreProvider
} from '../state/controllers';
export { authStoreContext, projectStoreContext } from '../state/context';
