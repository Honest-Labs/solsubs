import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { FC } from "react";
import "../index.css";

export const HomePage: FC<{}> = () => {
  return (
    <div className="text-white">
      <div className="ml-auto mr-auto relative">
        <header className="py-4 px-8 navbar !bg-transparent h-[80px]">
          <div className="w-full mx-auto flex justify-between items-center bg-transparent z-[10]">
            <div className="flex flex-row gap-3 items-center">
              <img
                src="/solsubs_logo.png"
                alt="SolSubs logo"
                className="w-10 h-10 z-[2]"
              />
              <div className="text-2xl font-extrabold">SolSubs</div>
            </div>
            <nav className="flex">
              <div className="flex space-x-6">
                <WalletMultiButton className="btn btn-primary z-[10]" />
              </div>
            </nav>
          </div>
        </header>
        <div className="h-[75vh] radial-gradient-custom-bg absolute top-0 right-0 left-0 z-[6]"></div>
        <div className="h-[75vh] absolute top-0 right-0 left-0 z-[6] max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 radial-gradient-custom-fg flex flex-col justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
              Welcome to SolSubs
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Your Subscription, Your Control
            </p>
          </div>
        </div>
        <div className="absolute top-[60vh]">
          <div>
            Key Feature 1: Subheader: "Blockchain-Powered Subscription Control"{" "}
            <br />
            Description: "Exercise total control over your subscriptions. Modify
            or terminate them directly from the blockchain—no middlemen, no
            hassle." <br /> Material Icon Suggestion: "manage_accounts" or
            "tune"
          </div>
          <div>
            Key Feature 2: Subheader: "Unrivaled Transaction Transparency"
            <br />
            Description: "Say goodbye to hidden fees and unexplained charges.
            Every transaction and activity is immutably and transparently
            recorded on the blockchain."
            <br /> Material Icon Suggestion: "visibility" or "assessment"
          </div>
          <div>
            Key Feature 3: Subheader: "Ultimate Data Privacy" <br />{" "}
            Description: "Rest assured, your subscription data is encrypted and
            stored on the blockchain. It's your data, and only you have access
            to it."
            <br />
            Material Icon Suggestion: "lock" or "verified_user"
          </div>
        </div>
      </div>
      <footer className="py-4 px-8 footer footer-center absolute bottom-0">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            &copy; 2023 SubChain. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
