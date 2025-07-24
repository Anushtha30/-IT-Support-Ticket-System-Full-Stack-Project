import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // Check if we're in demo mode
  const urlParams = new URLSearchParams(window.location.search);
  const demoRole = urlParams.get('demo');
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user", demoRole],
    queryFn: () => {
      const url = demoRole ? `/api/auth/user?role=${demoRole}` : '/api/auth/user';
      return fetch(url).then(res => {
        if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
        return res.json();
      });
    },
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    demoRole,
  };
}
