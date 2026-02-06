import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useContext, useState } from "react";
import { AuthProvider, AuthContext } from "../src/context/AuthContext";

function RootLayoutNav() {
  const { userToken, isLoading, user } = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Wait for the first render to complete before allowing navigation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading || !isMounted) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inAdminGroup = segments[0] === "(admin)";
    const inUserGroup = segments[0] === "(user)";

    if (!userToken && !inAuthGroup) {
      // 1. Not logged in -> Redirect to Login
      router.replace("/login");
    } else if (userToken) {
      // 2. Logged in -> Check Role
      // Admin/Pharmacist -> Go to Admin Dashboard
      const isAdmin = user?.role === 'admin' || user?.role === 'pharmacist';

      if (inAuthGroup) {
        // Coming from Login screen
        router.replace(isAdmin ? "/(admin)" : "/(user)");
      } else if (isAdmin && !inAdminGroup) {
        // Admin trying to access non-admin pages (or root)
        router.replace("/(admin)");
      } else if (!isAdmin && !inUserGroup) {
        // User trying to access non-user pages
        router.replace("/(user)");
      }
    }
  }, [userToken, user, isLoading, segments, isMounted]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
