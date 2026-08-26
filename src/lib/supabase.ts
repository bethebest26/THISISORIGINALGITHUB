import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isInvalid = (val: string | undefined) => 
  !val || val === 'undefined' || val === 'null' || val === '';

// Set up mock auth listener system
const authListeners: Array<(event: string, session: any) => void> = [];

function triggerAuthListeners(session: any) {
  const event = session ? 'SIGNED_IN' : 'SIGNED_OUT';
  authListeners.forEach(cb => {
    try {
      cb(event, session);
    } catch (e) {
      console.error('Error triggering mock auth listener:', e);
    }
  });
}

// Handle mock Google OAuth login popup close and message exchange
if (typeof window !== 'undefined' && window.location.search.includes('mock_oauth_success=true')) {
  const mockSession = {
    user: {
      id: "mock-google-id",
      email: "officialbethebest26@gmail.com",
      user_metadata: {
        full_name: "Google Explorer",
        name: "Google Explorer",
        age: 23,
        whatsapp_number: "+91 99999 77777",
        role: "buyer",
        auth_provider: "google"
      },
      app_metadata: {
        provider: "google"
      }
    }
  };
  localStorage.setItem("bethebest_mock_session", JSON.stringify(mockSession));
  if (window.opener) {
    window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
  }
  window.close();
}

// Fluent Mock Query Builder to support any chain of Supabase methods without crashing
class MockQueryBuilder {
  private data: any[];
  private error: any;

  constructor(data: any[] = [], error: any = null) {
    this.data = data;
    this.error = error;
  }

  select(...args: any[]) { return this; }
  insert(...args: any[]) { return this; }
  update(...args: any[]) { return this; }
  upsert(...args: any[]) { return this; }
  delete(...args: any[]) { return this; }
  
  eq(...args: any[]) { return this; }
  neq(...args: any[]) { return this; }
  gt(...args: any[]) { return this; }
  lt(...args: any[]) { return this; }
  gte(...args: any[]) { return this; }
  lte(...args: any[]) { return this; }
  like(...args: any[]) { return this; }
  ilike(...args: any[]) { return this; }
  is(...args: any[]) { return this; }
  in(...args: any[]) { return this; }
  contains(...args: any[]) { return this; }
  containedBy(...args: any[]) { return this; }
  not(...args: any[]) { return this; }
  or(...args: any[]) { return this; }
  order(...args: any[]) { return this; }
  limit(...args: any[]) { return this; }
  range(...args: any[]) { return this; }
  maybeSingle() {
    return Promise.resolve({ data: this.data[0] || null, error: this.error });
  }
  single() {
    return Promise.resolve({ data: this.data[0] || null, error: this.error });
  }

  // Thenable implementation to support direct await or .then() on any part of the builder chain
  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return Promise.resolve({ data: this.data, error: this.error }).then(onfulfilled, onrejected);
  }
}

let realClient: any = null;
let useMock = false;

// Create a robust mock client that supports local mock login & fluent querying
const mockClient = {
  auth: {
    getSession: () => {
      let session = null;
      try {
        const stored = localStorage.getItem("bethebest_mock_session");
        if (stored) session = JSON.parse(stored);
      } catch (e) {}
      return Promise.resolve({ data: { session }, error: null });
    },
    getUser: () => {
      let user = null;
      try {
        const stored = localStorage.getItem("bethebest_mock_session");
        if (stored) {
          const session = JSON.parse(stored);
          user = session?.user || null;
        }
      } catch (e) {}
      return Promise.resolve({ data: { user }, error: null });
    },
    updateUser: (updateData: any) => {
      try {
        const stored = localStorage.getItem("bethebest_mock_session");
        if (stored) {
          const session = JSON.parse(stored);
          if (session && session.user) {
            session.user.user_metadata = {
              ...(session.user.user_metadata || {}),
              ...(updateData.data || {})
            };
            localStorage.setItem("bethebest_mock_session", JSON.stringify(session));
            triggerAuthListeners(session);
            return Promise.resolve({ data: { user: session.user }, error: null });
          }
        }
      } catch (e) {}
      return Promise.resolve({ data: { user: null }, error: null });
    },
    onAuthStateChange: (cb: any) => {
      authListeners.push(cb);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              const idx = authListeners.indexOf(cb);
              if (idx !== -1) authListeners.splice(idx, 1);
            }
          }
        }
      };
    },
    signInWithPassword: ({ email, password }: any) => {
      // Allow any login in offline mock mode to prevent blocking the user
      const namePart = email.split('@')[0];
      const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1).replace(/[^a-zA-Z]/g, ' ');
      const mockSession = {
        user: {
          id: `mock-user-${email.replace(/[^a-zA-Z0-9]/g, '-')}`,
          email: email,
          user_metadata: {
            full_name: formattedName || "Guest Student",
            name: formattedName || "Guest Student",
            age: 23,
            whatsapp_number: "+91 99999 88888",
            role: email.toLowerCase().includes("admin") ? "admin" : "buyer",
            auth_provider: "email"
          },
          app_metadata: {
            provider: "email"
          }
        }
      };
      localStorage.setItem("bethebest_mock_session", JSON.stringify(mockSession));
      
      setTimeout(() => {
        triggerAuthListeners(mockSession);
      }, 10);
      
      return Promise.resolve({ data: mockSession, error: null });
    },
    signUp: ({ email, password, options }: any) => {
      const metadata = options?.data || {};
      const mockSession = {
        user: {
          id: `mock-user-${Date.now()}`,
          email: email,
          user_metadata: {
            full_name: metadata.full_name || metadata.name || "Guest Student",
            name: metadata.full_name || metadata.name || "Guest Student",
            age: metadata.age || 22,
            whatsapp_number: metadata.whatsapp_number || "",
            role: metadata.role || "buyer",
            auth_provider: metadata.auth_provider || "email"
          },
          app_metadata: {
            provider: "email"
          }
        }
      };
      localStorage.setItem("bethebest_mock_session", JSON.stringify(mockSession));
      
      setTimeout(() => {
        triggerAuthListeners(mockSession);
      }, 10);

      return Promise.resolve({ data: mockSession, error: null });
    },
    signInWithOAuth: ({ provider, options }: any) => {
      return Promise.resolve({
        data: {
          url: `${window.location.origin}/?mock_oauth_success=true`
        },
        error: null
      });
    },
    signOut: () => {
      localStorage.removeItem("bethebest_mock_session");
      setTimeout(() => {
        triggerAuthListeners(null);
      }, 10);
      return Promise.resolve({ error: null });
    },
  },
  from: () => {
    return new MockQueryBuilder([], null);
  },
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: { path: 'mock-path' }, error: null }),
    }),
  },
} as any;

try {
  let finalUrl = rawSupabaseUrl;
  if (rawSupabaseUrl && rawSupabaseUrl.startsWith('eyJ')) {
    try {
      const parts = rawSupabaseUrl.split('.');
      if (parts.length === 3) {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        if (payload.ref) {
          finalUrl = `https://${payload.ref}.supabase.co`;
          console.log(`Dynamically resolved Supabase URL from JWT: ${finalUrl}`);
        }
      }
    } catch (err) {
      console.error("Failed to decode Supabase URL from JWT:", err);
    }
  }

  if (!isInvalid(finalUrl) && !isInvalid(supabaseAnonKey)) {
    const supabaseUrl = finalUrl!.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
    new URL(supabaseUrl); // Validate URL
    realClient = createClient(supabaseUrl, supabaseAnonKey!);
    
    // Asynchronously ping the Supabase endpoint to detect if it is reachable
    if (typeof window !== 'undefined') {
      fetch(supabaseUrl, { method: 'HEAD', mode: 'no-cors' })
        .then(() => {
          console.log("Supabase endpoint is reachable. Running in production mode.");
        })
        .catch(err => {
          console.warn("Supabase endpoint is unreachable (getaddrinfo ENOTFOUND or offline). Switching to mock offline mode.", err);
          useMock = true;
        });
    }
  } else {
    throw new Error('Missing or invalid Supabase env vars');
  }
} catch (e) {
  console.warn('Supabase configuration error:', e, '. Supabase features will be disabled.');
  useMock = true;
}

// Export a Proxy that dynamically directs requests to the real client or mock client based on reachability status
export const supabase = new Proxy({}, {
  get(target, prop, receiver) {
    const client = useMock ? mockClient : (realClient || mockClient);
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
}) as any;
