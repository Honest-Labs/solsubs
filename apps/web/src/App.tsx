import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { HomePage } from "./pages/Home";
import { Wallet } from "./components/WalletProvider";

export const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <HomePage />,
    },
  ]);

  return (
    <Wallet>
      <RouterProvider router={router} />
    </Wallet>
  );
};
