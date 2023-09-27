import { CreatePlanModal } from "../../modals/CreatePlan";
import { trpc } from "../../trpc";
import { ENV, splTokens, terms } from "../../utils";

export const PlansView = () => {
  const { data, refetch, isLoading } = trpc.getPlans.useQuery();

  if (isLoading) {
    return (
      <div className="w-full flex flex-col justify-center items-center mt-24">
        <div className="loading loading-spinner bg-primary h-48 w-48"></div>
      </div>
    );
  }

  if (!isLoading && data?.length === 0) {
    return (
      <div className="w-full flex flex-col justify-center items-center mt-24">
        <p className="text-lg font-bold text-center mb-12">
          You have no plans yet. Create one now!
        </p>
        <CreatePlanModal refetch={refetch} />
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <CreatePlanModal refetch={refetch} />
      <div className="overflow-x-auto mt-12">
        <table className="table table-sm lg:table-lg bg-base-300">
          <thead>
            <tr>
              <th>Code</th>
              <th>Price</th>
              <th>Term</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((plan) => {
              const splToken = splTokens.find((t) => t.value === plan.splToken);
              return (
                <tr className="hover">
                  <td>
                    <div
                      className="flex flex-row gap-2 cursor-pointer"
                      onClick={() => {
                        window.open(
                          `https://solana.fm/address/${
                            plan.account
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
                  <td>{new Date(plan.createdAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
