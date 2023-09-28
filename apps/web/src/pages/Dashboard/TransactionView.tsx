import { useWallet } from "@solana/wallet-adapter-react";
import { trpc } from "../../trpc";
import { ENV, splTokens } from "../../utils";
import { FC } from "react";

export const TransactionView = () => {
  const { data, isLoading } = trpc.getTransactions.useQuery();
  const { publicKey } = useWallet();

  const openLinkTo = (account: string, isTx = false) => {
    window.open(
      `https://solana.fm/${isTx ? "tx" : "address"}/${account}${
        !isTx ? "/anchor-account" : ""
      }?cluster=${ENV === "prod" ? "mainnet-qn1" : "devnet-qn1"}`
    );
  };

  if (isLoading || !data) {
    return (
      <div className="w-full flex flex-col justify-center items-center mt-24">
        <div className="loading loading-spinner bg-primary h-48 w-48"></div>
      </div>
    );
  }

  console.log(data);

  const { plans, subscriptions, transactions } = data!;

  return (
    <div className="w-full h-full">
      <div className="overflow-x-auto mt-12">
        <table className="table table-sm lg:table-lg bg-base-300">
          <thead>
            <tr>
              <th>Tx</th>
              <th>To</th>
              <th>From</th>
              <th>Amount</th>
              <th>Charge Date</th>
              <th>Plan</th>
              <th>Subscription</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              const splToken = splTokens.find(
                (t) => t.value === transaction.splToken
              );
              const plan = plans.find((p) => p._id === transaction.planId)!;
              const subscription = subscriptions.find(
                (s) => s._id === transaction.subscriptionId
              )!;
              const Account: FC<{ account: string }> = ({ account }) => {
                if (account === publicKey?.toString()) {
                  return (
                    <div className="badge badge-lg badge-primary font-bold">
                      Me
                    </div>
                  );
                }

                if (account === plan.account) {
                  return (
                    <div className="badge badge-info badge-lg text-white font-bold">
                      Escrow
                    </div>
                  );
                }
                return (
                  <p>
                    {account.slice(0, 4)}****
                    {account.slice(-4)}
                  </p>
                );
              };
              return (
                <tr className="hover">
                  <td>
                    <div
                      className="flex flex-row gap-2 cursor-pointer"
                      onClick={() => {
                        openLinkTo(transaction.hash, true);
                      }}
                    >
                      <Account account={transaction.hash} />
                      <img
                        className="w-6 h-6 cursor-pointer"
                        src="https://solana.fm/favicon.ico"
                      />
                    </div>
                  </td>
                  <td>
                    <div
                      className="flex flex-row gap-2 cursor-pointer"
                      onClick={() => {
                        openLinkTo(transaction.to);
                      }}
                    >
                      <Account account={transaction.to} />
                      <img
                        className="w-6 h-6 cursor-pointer"
                        src="https://solana.fm/favicon.ico"
                      />
                    </div>
                  </td>
                  <td>
                    <div
                      className="flex flex-row gap-2 cursor-pointer"
                      onClick={() => {
                        openLinkTo(transaction.from);
                      }}
                    >
                      <Account account={transaction.from} />
                      <img
                        className="w-6 h-6 cursor-pointer"
                        src="https://solana.fm/favicon.ico"
                      />
                    </div>
                  </td>
                  <td>
                    <div
                      className="flex flex-row gap-2 cursor-pointer"
                      onClick={() => {
                        openLinkTo(transaction.splToken);
                      }}
                    >
                      {transaction.amount / 10 ** (splToken?.decimals || 0)}
                      <p>{splToken?.label}</p>
                      <img
                        className="w-6 h-6"
                        src="https://solana.fm/favicon.ico"
                      />
                    </div>
                  </td>
                  <td>
                    {new Date(subscription.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div
                      className="flex flex-row gap-2 cursor-pointer"
                      onClick={() => {
                        openLinkTo(plan.account);
                      }}
                    >
                      <p>{plan?.code}</p>
                      <img
                        className="w-6 h-6"
                        src="https://solana.fm/favicon.ico"
                      />
                    </div>
                  </td>
                  <td>
                    <div
                      className="flex flex-row gap-2 cursor-pointer"
                      onClick={() => {
                        openLinkTo(subscription.account);
                      }}
                    >
                      <Account account={subscription.account} />
                      <img
                        className="w-6 h-6"
                        src="https://solana.fm/favicon.ico"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
