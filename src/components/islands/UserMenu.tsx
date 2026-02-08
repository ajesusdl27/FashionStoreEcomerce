import { useState, useEffect, useRef } from "react";
import { User, LogOut, Package, ChevronDown, Settings } from "lucide-react";
import { useAuth } from "./AuthProvider";

export default function UserMenu() {
  const { user, isLoading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    signOut();
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (user?.full_name) {
      return user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  // Loading state
  if (isLoading) {
    return <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />;
  }

  // Not logged in
  if (!user) {
    return (
      <a
        href="/cuenta"
        className="touch-target flex items-center justify-center hover:text-primary transition-colors"
        aria-label="Iniciar sesión"
      >
        <User className="w-5 h-5" />
      </a>
    );
  }

  // Logged in - show dropdown
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 touch-target hover:text-primary transition-colors group"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar */}
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.full_name || "Avatar"}
            className="w-8 h-8 rounded-full object-cover border-2 border-transparent group-hover:border-primary transition-colors"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            {getInitials()}
          </div>
        )}
        <ChevronDown
          className={`w-4 h-4 hidden sm:block transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium truncate">
              {user.full_name || "Usuario"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <a
              href="/cuenta"
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors"
            >
              <User className="w-4 h-4" />
              Mi Cuenta
            </a>
            <a
              href="/cuenta/pedidos"
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted transition-colors"
            >
              <Package className="w-4 h-4" />
              Mis Pedidos
            </a>

            {/* Admin Link */}
            {user.is_admin && (
              <a
                href="/admin"
                className="flex items-center gap-3 px-4 py-2 text-sm text-primary hover:bg-muted transition-colors"
              >
                <Settings className="w-4 h-4" />
                Panel Admin
              </a>
            )}
          </div>

          {/* Logout */}
          <div className="border-t border-border pt-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors w-full"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
