import { useState } from "react";
import { trpc } from "../../trpc";
import { ENV, splTokens, terms } from "../../utils";

export const SubscriptionView = () => {
  const [isMine, setIsMine] = useState(false);
  const { data, isLoading } = trpc.getSubscriptions.useQuery(isMine);

  if (isLoading || !data) {
    return (
      <div className="w-full flex flex-col justify-center items-center mt-24">
        <div className="loading loading-spinner bg-primary h-48 w-48"></div>
      </div>
    );
  }

  const { plans, subscriptions } = data!;

  return (
    <div className="w-full h-full">
      <div className="form-control w-52">
        <label className="cursor-pointer label">
          <span className="label-text">My Subscriptions</span>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={isMine}
            onChange={(e) => setIsMine(!isMine)}
          />
        </label>
      </div>
      <div className="overflow-x-auto mt-12">
        <table className="table table-sm lg:table-lg bg-base-300">
          <thead>
            <tr>
              {!isMine && <th>Subscriber</th>}
              <th>Subscription</th>
              <th>Price</th>
              <th>Term</th>
              <th>Created At</th>
              <th>Next Charge Date</th>
              {isMine && <th>Cancel</th>}
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((subscription) => {
              const splToken = splTokens.find(
                (t) => t.value === subscription.splToken
              );
              const plan = plans.find((p) => p._id === subscription.planId)!;
              return (
                <tr className="hover">
                  {!isMine && (
                    <td>
                      <div
                        className="flex flex-row gap-2 cursor-pointer"
                        onClick={() => {
                          window.open(
                            `https://solana.fm/address/${
                              subscription.owner
                            }/anchor-account?cluster=${
                              ENV === "prod" ? "mainnet-qn1" : "devnet-qn1"
                            }`
                          );
                        }}
                      >
                        <p>
                          {subscription.account.slice(0, 4)}****
                          {subscription.account.slice(-4)}
                        </p>
                        <img
                          className="w-6 h-6 cursor-pointer"
                          src="https://solana.fm/favicon.ico"
                        />
                      </div>
                    </td>
                  )}
                  <td>
                    <div
                      className="flex flex-row gap-2 cursor-pointer"
                      onClick={() => {
                        window.open(
                          `https://solana.fm/address/${
                            subscription.account
                          }/anchor-account?cluster=${
                            ENV === "prod" ? "mainnet-qn1" : "devnet-qn1"
                          }`
                        );
                      }}
                    >
                      <p>{plan.code}</p>
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
                        window.open(
                          `https://solana.fm/address/${
                            plan.splToken
                          }/anchor-account?cluster=${
                            ENV === "prod" ? "mainnet-qn1" : "devnet-qn1"
                          }`
                        );
                      }}
                    >
                      {plan.price / 10 ** (splToken?.decimals || 0)}
                      <p>{splToken?.label}</p>
                      <img
                        className="w-6 h-6"
                        src="https://solana.fm/favicon.ico"
                      />
                    </div>
                  </td>
                  <td>{terms.find((t) => t.value === plan.term)?.label}</td>
                  <td>
                    {new Date(subscription.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div
                      className="tooltip"
                      data-tip={new Date(
                        subscription.nextTermDate
                      ).toLocaleTimeString()}
                    >
                      {new Date(subscription.nextTermDate).toLocaleDateString()}
                    </div>
                  </td>
                  {isMine && (
                    <td>
                      <button className="btn btn-error">Cancel</button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
