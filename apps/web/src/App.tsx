import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { HomePage } from "./pages/Home";
import { Wallet } from "./components/WalletProvider";
import { DashboardPage } from "./pages/Dashboard/Dashboard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "./trpc";
import { getApps, initializeApp } from "firebase/app";
import { configMap } from "./firebase-config";
import { initializeAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { UserContext, UserContextProvider } from "./context/UserContext";
const env = import.meta.env.VITE_REST_ENVIRONMENT!;

if (!getApps().length) {
  const config = configMap[env as keyof typeof configMap];
  const app = initializeApp(config);
  if (env !== "local") {
    initializeAnalytics(app);
  }
}

export const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <HomePage />,
    },
    {
      path: "/dashboard",
      element: <DashboardPage />,
    },
  ]);

  const baseUrl =
    env === "prod"
      ? "https://trpc-ioqkl6ubja-uk.a.run.app"
      : "https://trpc-ioqkl6ubja-uk.a.run.app";
  const queryClient = new QueryClient();
  const trpcClient = trpc.createClient({
    links: [
      httpBatchLink({
        url: `${baseUrl}/trpc`,
        async headers() {
          const auth = getAuth();
          const jwt = await auth.currentUser?.getIdToken();
          if (jwt) {
            return {
              Authorization: jwt,
            };
          } else {
            return {};
          }
        },
      }),
    ],
  });

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Wallet>
          <UserContextProvider>
            <RouterProvider router={router} />
          </UserContextProvider>
        </Wallet>
      </QueryClientProvider>
    </trpc.Provider>
  );
};
