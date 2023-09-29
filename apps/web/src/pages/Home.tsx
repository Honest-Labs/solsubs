import { FC } from "react";
import "../index.css";
import { useNavigate } from "react-router-dom";
import { openLinkToExplorer } from "../utils";

export const HomePage: FC<{}> = () => {
  const navigate = useNavigate();

  return (
    <div className="text-white">
      <div className="ml-auto mr-auto relative h-[100vh]">
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
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/dashboard")}
                >
                  Launch App
                </button>
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
              Your Subscription,{" "}
              <span className="font-bold text-primary">Your Control</span>
            </p>
            <button
              className="btn btn-primary btn-outline mt-12 min-w-[300px]"
              onClick={() => navigate("/dashboard")}
            >
              Get Started Now
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 items-center w-full text-center justify-center cursor-pointer">
        <p>Beta Version currently Live on Devnet.</p>
        <button
          onClick={() =>
            openLinkToExplorer("6qMvvisbUX3Co1sZa7DkyCXF8FcsTjzKSQHcaDoqSLbw")
          }
          className="btn btn-primary btn-outline"
        >
          View Program
          <img
            className="w-6 h-6 cursor-pointer self-center"
            src="https://solana.fm/favicon.ico"
          />
        </button>
      </div>
      <div className="flex flex-col gap-8">
        <p className="text-center text-2xl font-bold mt-8 mb-16">
          On-Chain Subscription Service powered by the speed of Solana
        </p>
        <p className="text-center text-2xl font-bold">How it works</p>
        <div className="flex flex-row flex-wrap px-4 gap-8 w-full justify-evenly">
          <div className="bg-base-200 rounded-lg px-8 py-4 max-w-[500px]">
            <h2 className="text-2xl mb-8">Plans</h2>
            <ul className="flex flex-col gap-4 list-disc">
              <li className="list-item">
                Plans are created by businesses or creators looking to offer a
                subscription service to users.
              </li>
              <li className="list-item">
                Simply define a term and price and create your plan.
              </li>
              <li className="list-item">
                Once created, users can access your plan and create and manage
                their subscription through a unique link.
              </li>
              <li className="list-item">
                Thats it! The wallet you used to create your plan will be
                credited with the funds.
              </li>
            </ul>
          </div>
          <div className="bg-base-200 rounded-lg px-8 py-4 max-w-[500px]">
            <h2 className="text-2xl mb-8">Subscriptions</h2>
            <ul className="flex flex-col gap-4 list-disc">
              <li className="list-item">
                Created by users, subscriptions are linked to a plan provided by
                a business or creator.
              </li>
              <li className="list-item">
                Users are charged only once per term according to the
                subscription.
              </li>
              <li className="list-item">
                This is made possible by the user delegating tokens to be
                charged later to the subscription.
              </li>
              <li className="list-item">
                Thats it! Users can now subscribe to services and offerings from
                there favorite creators.
              </li>
            </ul>
          </div>
        </div>
        {/* <img
          className="w-24 h-24"
          src="https://s2.coinmarketcap.com/static/img/coins/200x200/5426.png"
        /> */}
      </div>
      {/* <div className="absolute top-[60vh]">
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
        </div> */}
      <footer className="py-4 px-8 footer footer-center">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            &copy; 2023 SubChain. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
