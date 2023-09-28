import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { HomePage } from "./pages/Home";
import { Wallet } from "./components/WalletProvider";
import { DashboardPage } from "./pages/Dashboard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "./trpc";
import { getApps, initializeApp } from "firebase/app";
import { configMap } from "./firebase-config";
import { initializeAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { UserContext, UserContextProvider } from "./context/UserContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Colors,
  Tooltip,
  BarElement,
  BarController,
  Title,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  LineElement,
  Filler,
  Colors,
  BarElement,
  BarController,
  Title
);

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
            <div className="text-white">
              <RouterProvider router={router} />
            </div>
          </UserContextProvider>
        </Wallet>
      </QueryClientProvider>
    </trpc.Provider>
  );
};
