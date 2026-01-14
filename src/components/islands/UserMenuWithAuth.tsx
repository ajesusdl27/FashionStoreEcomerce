import AuthProvider from './AuthProvider';
import UserMenu from './UserMenu';

// Wrapper component that provides AuthProvider context to UserMenu
// This is needed because in Astro, each React island is isolated
export default function UserMenuWithAuth() {
  return (
    <AuthProvider>
      <UserMenu />
    </AuthProvider>
  );
}
