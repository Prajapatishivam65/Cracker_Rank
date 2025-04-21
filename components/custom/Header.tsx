"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/custom/ThemeToggle";

// Define user type based on what getCurrentUser returns
type UserData = {
  id: string;
  email: string;
  role: "admin" | "user";
} | null;

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<UserData>(null);
  const [isLoading, setIsLoading] = useState(true);

  //   useEffect(() => {
  //     const fetchUser = async () => {
  //       try {
  //         const userData = await getCurrentUser();
  //         setUser(userData);
  //       } catch (error) {
  //         console.error("Failed to fetch user data:", error);
  //       } finally {
  //         setIsLoading(false);
  //       }
  //     };

  //     fetchUser();
  //   }, []);

  const navigation = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "About", href: "#about" },
  ];

  // Extract username from email (before the @ symbol)
  const getUserDisplayName = (email: string) => {
    return email.split("@")[0];
  };

  return (
    <header className="fixed w-full top-0 z-50 backdrop-blur-lg bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 text-transparent bg-clip-text"
          >
            Quinx
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}

            {/* Auth Button or User Profile */}
            {!isLoading &&
              (user ? (
                <div className="flex items-center">
                  <div className="mr-2 text-gray-700 dark:text-gray-300">
                    Hello, {getUserDisplayName(user.email)}
                    {user.role === "admin" && (
                      <span className="ml-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  <Link
                    href="/api/auth/logout"
                    className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    Logout
                  </Link>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200"
                >
                  Sign In
                </Link>
              ))}

            {/* Theme Toggle */}
            <ThemeToggle />
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <nav className="container mx-auto px-4 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block py-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}

            {/* Mobile Auth Button or User Profile */}
            {!isLoading && !user && (
              <Link
                href="/auth/signin"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full mt-3 px-4 py-2 text-center rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200"
              >
                Sign In
              </Link>
            )}

            {!isLoading && user && (
              <div className="mt-3 py-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Signed in as {getUserDisplayName(user.email)}
                  {user.role === "admin" && (
                    <span className="ml-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </p>
                <Link
                  href="/api/auth/logout"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full px-4 py-2 text-center rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Logout
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
