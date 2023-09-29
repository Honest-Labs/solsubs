import { useState } from "react";
import { trpc } from "../../trpc";
import { ENV, splTokens, terms } from "../../utils";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

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
              <th>Created At</th>
              <th>Next Charge Date</th>
              <th
                className="tooltip"
                data-tip="Whether the subscription has a proper token delegation"
              >
                Delegation Status
              </th>
              {isMine && <th>Cancel</th>}
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((subscription) => {
              const splToken = splTokens.find(
                (t) => t.value === subscription.splToken
              );
              const delegationInfo = data?.delegationInfo.find(
                (d) => d.subscriptionId === subscription._id
              );
              const plan = plans.find((p) => p._id === subscription.planId)!;
              const isDelegated =
                delegationInfo?.delegate === subscription.account;
              const sufficentDelegation =
                (delegationInfo?.delegatedAmount || 0) > plan?.price;
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
                  <td>
                    <div
                      className={`badge badge-lg ${
                        !isDelegated
                          ? "badge-error"
                          : sufficentDelegation
                          ? "badge-success"
                          : "badge-warning"
                      }`}
                    >
                      {!isDelegated
                        ? "Not Delegated"
                        : sufficentDelegation
                        ? "Delegated"
                        : "Insufficient Balance"}
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
