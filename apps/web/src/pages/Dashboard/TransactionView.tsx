import { useWallet } from "@solana/wallet-adapter-react";
import { trpc } from "../../trpc";
import { ENV, openLinkToExplorer, splTokens } from "../../utils";
import { FC } from "react";

export const TransactionView = () => {
  const { data: transactionTotals } = trpc.getTransactionsTotals.useQuery();
  const { data, isLoading } = trpc.getTransactions.useQuery();
  const { publicKey } = useWallet();

  if (isLoading || !data) {
    return (
      <div className="w-full flex flex-col justify-center items-center mt-24">
        <div className="loading loading-spinner bg-primary h-48 w-48"></div>
      </div>
    );
  }

  console.log(transactionTotals);

  const { plans, subscriptions, transactions } = data!;
  const payouts = transactionTotals?.filter(
    (t: any) => t?._id?.type === "payout"
  ) as any;

  const payments = transactionTotals?.find(
    (t: any) => t?._id?.type === "payment"
  ) as any;

  return (
    <div className="w-full h-full">
      <div className="flex flex-row gap-4">
        <div className="rounded-lg bg-base-200 p-8">
          <h2 className="text-2xl font-bold mb-6">Total Payouts</h2>
          {!payouts?.length && <p>You currently have no payouts</p>}
          {payouts.map((payout: any) => {
            const splToken = splTokens.find(
              (t) => t.value === payout._id.splToken
            );
            return (
              <div className="text-xl text-primary">
                {payout?.total} {splToken?.label}
              </div>
            );
          })}
        </div>
        <div className="rounded-lg bg-base-200 p-8">
          <h2 className="text-2xl font-bold mb-6">Total Payments</h2>
          {!payments?.length && <p>You currently have no payments</p>}
          {payments?.map((payment: any) => {
            const splToken = splTokens.find(
              (t) => t.value === payment._id.splToken
            );
            return (
              <div className="text-xl text-primary">
                {payment?.total} {splToken?.label}
              </div>
            );
          })}
        </div>
      </div>
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
                        openLinkToExplorer(transaction.hash, true);
                      }}
                    >
                      <Account account={transaction.hash} />
                      <img
                        className="w-6 h-6 cursor-pointer self-center"
                        src="https://solana.fm/favicon.ico"
                      />
                    </div>
                  </td>
                  <td>
                    <div
                      className="flex flex-row gap-2 cursor-pointer"
                      onClick={() => {
                        openLinkToExplorer(transaction.to);
                      }}
                    >
                      <Account account={transaction.to} />
                      <img
                        className="w-6 h-6 cursor-pointer self-center"
                        src="https://solana.fm/favicon.ico"
                      />
                    </div>
                  </td>
                  <td>
                    <div
                      className="flex flex-row gap-2 cursor-pointer"
                      onClick={() => {
                        openLinkToExplorer(transaction.from);
                      }}
                    >
                      <Account account={transaction.from} />
                      <img
                        className="w-6 h-6 cursor-pointer self-center"
                        src="https://solana.fm/favicon.ico"
                      />
                    </div>
                  </td>
                  <td>
                    <div
                      className="flex flex-row gap-2 cursor-pointer"
                      onClick={() => {
                        openLinkToExplorer(transaction.splToken);
                      }}
                    >
                      {transaction.amount / 10 ** (splToken?.decimals || 0)}
                      <p>{splToken?.label}</p>
                      <img
                        className="w-6 h-6 self-center"
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
                        openLinkToExplorer(plan.account);
                      }}
                    >
                      <p>{plan?.code}</p>
                      <img
                        className="w-6 h-6 self-center"
                        src="https://solana.fm/favicon.ico"
                      />
                    </div>
                  </td>
                  <td>
                    <div
                      className="flex flex-row gap-2 cursor-pointer"
                      onClick={() => {
                        openLinkToExplorer(subscription.account);
                      }}
                    >
                      <Account account={subscription.account} />
                      <img
                        className="w-6 h-6 self-center"
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
