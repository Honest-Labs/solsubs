import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { FC, useState } from "react";
import { CreatePlanModal } from "../modals/CreatePlan";

export const HomePage: FC<{}> = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { connected } = useWallet();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  return (
    <div className="text-white">
      <header className="py-4 px-8 navbar">
        <div className="w-full mx-auto flex justify-between items-center">
          <div className="text-2xl font-extrabold">SubChain</div>
          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d={
                    isMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16m-7 6h7"
                  }
                ></path>
              </svg>
            </button>
          </div>
          <nav className="flex">
            <div className="flex space-x-6">
              {connected && <CreatePlanModal />}
              <WalletMultiButton className="btn btn-primary" />
            </div>
          </nav>
        </div>
      </header>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
            Welcome to SubChain
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Your Subscription, Your Control
          </p>
        </div>
        <div className="mt-10">
          <h2 className="text-center text-xl font-semibold">
            Manage Your Subscriptions with SubChain
          </h2>
          <p className="mt-2 max-w-2xl mx-auto text-center text-xl">
            Empower yourself to take control of your subscriptions effortlessly
            using blockchain technology. SubChain allows you to manage and
            control your subscriptions on your terms, ensuring you're always in
            charge.
          </p>
        </div>
        <div className="mt-12">
          <h3 className="text-center text-lg font-semibold">Key Features:</h3>
          <ul className="mt-3 max-w-2xl mx-auto grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <li className="flex items-start lg:col-span-1">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  {/* SVG or icon */}
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold">
                  Self-Managed Subscriptions
                </h4>
                <p className="mt-2 text-base">
                  Own, modify, or cancel your subscriptions directly from the
                  blockchain.
                </p>
              </div>
            </li>
            <li className="flex items-start lg:col-span-1">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  {/* SVG or icon */}
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold">
                  Transparent Transactions
                </h4>
                <p className="mt-2 text-base">
                  Every payment and action is securely recorded on the
                  blockchain for complete transparency.
                </p>
              </div>
            </li>
            <li className="flex items-start lg:col-span-1">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  {/* SVG or icon */}
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold">Data Privacy</h4>
                <p className="mt-2 text-base">
                  Your subscription data is securely stored and accessible only
                  to you, respecting your privacy.
                </p>
              </div>
            </li>
          </ul>
        </div>
        <div className="mt-16 text-center">
          <p className="text-xl font-semibold mb-4">How It Works</p>
          <ol className="max-w-2xl mx-auto list-decimal text-xl">
            <li className="mb-2">
              <strong>Create Your Profile:</strong> Sign up for SubChain and
              securely link your subscriptions to your account.
            </li>
            <li className="mb-2">
              <strong>Manage Subscriptions:</strong> View, update, or cancel
              subscriptions in real-time using our intuitive interface.
            </li>
            <li className="mb-2">
              <strong>Secure Blockchain Transactions:</strong> All
              subscription-related transactions are securely recorded on the
              blockchain for your peace of mind.
            </li>
          </ol>
        </div>
        <div className="mt-16 text-center">
          <p className="text-xl font-semibold mb-4">Why Choose SubChain?</p>
          <p className="text-xl mb-8">
            SubChain revolutionizes subscription management by putting you in
            control. Say goodbye to hidden fees, unauthorized charges, and the
            hassle of managing subscriptions through multiple platforms.
            Experience a seamless and secure way to manage your subscriptions
            with SubChain.
          </p>
          <p className="text-xl font-semibold">
            Ready to take control of your subscriptions?{" "}
            <a href="#" className="underline">
              Get Started Now
            </a>
            !
          </p>
        </div>
      </div>
      <footer className="py-4 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            &copy; 2023 SubChain. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
