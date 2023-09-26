import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { trpc } from "../trpc";

const SignIn = () => {
  const wallet = useWallet();
  const { user } = useContext(UserContext);
  const { mutateAsync: getVerificationMessage } =
    trpc.getVerificationMessage.useMutation();
  const { mutateAsync: verify } = trpc.verify.useMutation();
  const [signature, setSignature] = useState<Uint8Array>();

  console.log(user);

  useEffect(() => {
    if (signature) {
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
      if (wallet.connected && !user && !signature?.toString()) {
        const message = await getVerificationMessage({
          publicKey: wallet.publicKey?.toString()!,
        });
        const signed = await wallet.signMessage!(
          new window.TextEncoder().encode(message)
        );
        setSignature(signed);
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
    <div className="px-4 py-12 rounded-lg m-auto mt-12 max-w-[90%] sm:max-w-[350px] bg-base-200">
      <h3 className="font-bold text-4xl mb-24">Sign to Continue</h3>
      <WalletMultiButton />
    </div>
  );
};

const Navbar = () => {
  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <a className="bold  cursor-pointer normal-case text-2xl">SolSubs</a>
      </div>
      <div className="flex-none">
        <WalletMultiButton />
      </div>
    </div>
  );
};

export const DashboardPage = () => {
  const wallet = useWallet();
  const { user } = useContext(UserContext);

  return (
    <div>
      <Navbar />
      {(!wallet.connected || !user) && !wallet.connecting && <SignIn />}
      {wallet.connected && <div></div>}
    </div>
  );
};
