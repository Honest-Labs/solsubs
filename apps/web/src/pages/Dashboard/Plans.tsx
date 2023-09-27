import { CreatePlanModal } from "../../modals/CreatePlan";
import { trpc } from "../../trpc";
import { ENV, splTokens, terms } from "../../utils";

export const PlansView = () => {
  const { data, refetch } = trpc.getPlans.useQuery();

  console.log(data);

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
