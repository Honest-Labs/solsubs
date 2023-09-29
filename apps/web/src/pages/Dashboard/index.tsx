import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/UserContext";
import {
  MdAnalytics,
  MdConstruction,
  MdDashboard,
  MdGroups,
  MdMenu,
  MdOutlineSubscriptions,
  MdPayment,
  MdPerson,
  MdScale,
  MdShoppingCart,
  MdSpaceDashboard,
  MdSubscriptions,
} from "react-icons/md";
import { trpc } from "../../trpc";
import { PlansView } from "./Plans";
import { SubscriptionView } from "./Subscriptions";
import { TransactionView } from "./TransactionView";
import { AnalyticsView } from "./Analytics";

const SignIn = () => {
  const wallet = useWallet();
  const { user } = useContext(UserContext);
  const { mutateAsync: getVerificationMessage } =
    trpc.getVerificationMessage.useMutation();
  const { mutateAsync: verify } = trpc.verify.useMutation();
  const [signature, setSignature] = useState<Uint8Array>();
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    if (signature && wallet.publicKey) {
      (async () => {
        const token = await verify({
          signature: Array.from(signature),
          publicKey: wallet.publicKey?.toString()!,
        });
        await signInWithCustomToken(getAuth(), token);
      })();
    }
  }, [signature]);

  useEffect(() => {
    (async () => {
      if (wallet.connected && !user && !signature?.toString() && !requested) {
        try {
          setRequested(true);
          const message = await getVerificationMessage({
            publicKey: wallet.publicKey?.toString()!,
          });
          const signed = await wallet.signMessage!(
            new window.TextEncoder().encode(message)
          );
          setSignature(signed);
        } catch (e) {
          console.log(e);
          setSignature(undefined);
          setRequested(false);
        }
      }
    })();
  }, [wallet.connected, user, signature]);

  if (wallet.connected && !user) {
    return (
      <div className="w-full flex flex-col justify-center items-center mt-24">
        <p className="text-lg font-bold text-center mb-12">
          Sign message in wallet
        </p>
        <div className="loading loading-spinner bg-primary h-48 w-48"></div>
      </div>
    );
  }

  return (
    <div className="px-8 py-12 rounded-lg m-auto mt-12 max-w-[90%] sm:max-w-[350px] bg-gray-900">
      <h3 className="font-bold text-4xl mb-36">Sign to Continue</h3>
      <WalletMultiButton />
    </div>
  );
};

export const DashboardPage = () => {
  const wallet = useWallet();
  const { user } = useContext(UserContext);
  const sidebarOptions = [
    {
      label: "Analytics",
      icon: <MdAnalytics className="h-8 w-8 text-primary" />,
    },
    {
      label: "Plans",
      icon: <MdConstruction className="h-8 w-8 text-primary" />,
    },
    {
      label: "Subscriptions",
      icon: <MdGroups className="h-8 w-8 text-primary" />,
    },
    {
      label: "Transactions",
      icon: <MdPayment className="h-8 w-8 text-primary" />,
    },
  ];
  const [activeSidebarOption, setActiveSidebarOption] = useState(
    sidebarOptions[0]
  );

  const closeSidebar = () => {
    document.getElementById("my-drawer")?.click();
  };

  return (
    <div className="h-full">
      {(!wallet.connected || !user) && <SignIn />}
      {wallet.connected && !!user && (
        <div className="w-full h-full flex flex-col md:flex-row drawer">
          <input id="my-drawer" type="checkbox" className="drawer-toggle" />
          <div className="md:hidden flex flex-row mt-[25px] w-full justify-evenly">
            <div className="flex flex-col gap-4">
              <div className="cursor-pointer flex gap-2 flex-row">
                <img
                  src="/solsubs_logo.png"
                  alt="SolSubs logo"
                  className="w-12 h-12"
                />
                <p className="bold normal-case text-3xl">SolSubs</p>
              </div>
              <label htmlFor="my-drawer" className="btn btn-square btn-ghost">
                <MdMenu className="h-12 w-12 text-white" />
              </label>
            </div>
            <WalletMultiButton />
          </div>
          <div className="drawer-side h-full z-[6]">
            <label htmlFor="my-drawer" className="drawer-overlay"></label>
            <div className="flex flex-col gap-4 bg-slate-800 h-full">
              {sidebarOptions.map((option) => (
                <div
                  className={`flex flex-row gap-2 hover:bg-slate-600 py-10 rounded cursor-pointer px-4 ${
                    option.label === activeSidebarOption.label
                      ? "bg-slate-600"
                      : ""
                  }`}
                  key={option.label}
                  onClick={() => {
                    setActiveSidebarOption(option);
                    closeSidebar();
                  }}
                >
                  {option.icon}
                  <p className="text-xl text-white bold">{option.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="max-w-[275px] bg-gray-900 hidden md:flex flex-col md:h-auto h-[100%] min-h-[100vh]">
            <div className="cursor-pointer flex flex-col gap-4 py-4  px-4 items-center">
              <img
                src="/solsubs_logo.png"
                alt="SolSubs logo"
                className="w-32 h-32"
              />
              {/* <p className="bold normal-case text-2xl text-white">SolSubs</p> */}
            </div>
            {sidebarOptions.map((option) => (
              <div
                className={`flex flex-row gap-2 hover:bg-slate-600 py-10 rounded cursor-pointer px-4 ${
                  option.label === activeSidebarOption.label
                    ? "bg-slate-600"
                    : ""
                }`}
                key={option.label}
                onClick={() => setActiveSidebarOption(option)}
              >
                {option.icon}
                <p className="text-xl text-white bold">{option.label}</p>
              </div>
            ))}
          </div>
          <div className="drawer-content flex flex-col flex-1 md:p-8 p-2 z-[5]">
            <div className="hidden md:flex justify-between">
              <p className="text-error text-2xl font-bold">
                Currently in Beta on Devnet
              </p>
              <WalletMultiButton />
            </div>
            {activeSidebarOption.label === "Analytics" && <AnalyticsView />}
            {activeSidebarOption.label === "Plans" && <PlansView />}
            {activeSidebarOption.label === "Subscriptions" && (
              <SubscriptionView />
            )}
            {activeSidebarOption.label === "Transactions" && (
              <TransactionView />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
