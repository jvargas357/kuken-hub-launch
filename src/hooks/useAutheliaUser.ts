import { useState, useEffect } from "react";

interface AutheliaUser {
  username: string | null;
  isAdmin: boolean;
  loading: boolean;
}

const ADMIN_USERS = ["admin", "sebastian"];

/**
 * Fetches the authenticated user from Authelia via the nginx /api/user endpoint.
 * Nginx should be configured to expose the Remote-User header:
 *
 *   location /api/user {
 *       add_header Content-Type application/json;
 *       return 200 '{"user": "$http_remote_user"}';
 *   }
 */
export function useAutheliaUser(): AutheliaUser {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const data = await res.json();
          const user = data.user?.trim() || null;
          setUsername(user);
        }
      } catch {
        // Not behind Authelia / endpoint not available
        setUsername(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return {
    username,
    isAdmin: username !== null && ADMIN_USERS.includes(username.toLowerCase()),
    loading,
  };
}
