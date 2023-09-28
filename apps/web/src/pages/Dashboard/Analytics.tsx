import { useEffect, useRef, useState } from "react";
import { trpc } from "../../trpc";
import { subDays, differenceInDays } from "date-fns";
import { openLinkToExplorer, splTokens } from "../../utils";
import { Line } from "react-chartjs-2";

const colors = ["#f2cf1f", "#62e3ef", "#fb923c", "#1b191f"];

export const AnalyticsView = () => {
  const isMobile = window.innerWidth < 800;
  const dateOptions = [
    { label: "today", days: 1 },
    { label: "week", days: 7 },
    { label: "month", days: 30 },
    { label: "year", days: 365 },
  ];
  const [activeDateOption, setActiveDateOption] = useState(dateOptions[0]);
  const [startDate, setStartDate] = useState(subDays(new Date(), 1));
  const [endDate, setEndDate] = useState(new Date());
  const { data } = trpc.getDashboardData.useQuery({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });
  const lineGraphRef = useRef<any>();

  useEffect(() => {
    setEndDate(new Date());
    setStartDate(subDays(new Date(), activeDateOption.days!));
  }, [activeDateOption]);

  console.log(data);
  const allDates = data?.revenueByToken.reduce((acc, curr) => {
    for (const time of curr.times) {
      acc.add(time.time);
    }
    return acc;
  }, new Set<string>());

  const sortedDates = Array.from(allDates?.keys() || []).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  console.log(sortedDates);

  return (
    <div className="h-full w-full flex-col flex gap-8">
      <div className="flex flex-row w-full gap-6 mt-10">
        <p className="text-white text-3xl font-bold">Analytics</p>
        <div className="flex flex-1 gap-4 flex-wrap">
          {dateOptions.map((o) => (
            <div
              onClick={() => setActiveDateOption(o)}
              className={`badge badge-lg self-center text-xl p-6 cursor-pointer font-bold ${
                o.label === activeDateOption.label
                  ? "badge-primary"
                  : "badge-ghost"
              }`}
            >
              {o.label}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-row gap-6 flex-wrap">
        <div className="rounded-lg bg-base-200 p-4">
          <h2 className="text-2xl font-bold mb-6">Subscriptions</h2>
          <div className="text-xl text-primary font-bold">
            {data?.totalSubscriptionsCreated}
          </div>
        </div>
        <div className="rounded-lg bg-base-200 p-4">
          <h2 className="text-2xl font-bold mb-6">Payouts</h2>
          <div className="text-xl text-primary font-bold">
            {data?.totalPayouts}
          </div>
        </div>
        <div className="rounded-lg bg-base-200 p-4">
          <h2 className="text-2xl font-bold mb-6">Net Revenue</h2>
          {data?.revenueByPlan.map((rev: any) => {
            console.log(rev);
            const plan = data?.plans.find((p) => p._id === rev._id)!;
            const splToken = splTokens.find((t) => t.value === plan.splToken);
            return (
              <div className="md:text-xl text-primary flex flex-row font-bold justify-between gap-8">
                <div
                  className="flex flex-row gap-2 cursor-pointer"
                  onClick={() => openLinkToExplorer(plan.account)}
                >
                  <img
                    className="w-6 h-6 cursor-pointer self-center"
                    src="https://solana.fm/favicon.ico"
                  />{" "}
                  {plan?.code}
                </div>
                <div>
                  {rev?.sum} {splToken?.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex flex-row gap-8">
        <div className="min-w-[100px] mt-12">
          <div className="flex flex-row flex-wrap">
            {data?.revenueByToken.map((rev, i) => {
              const splToken = splTokens.find((t) => t.value === rev._id);
              return (
                <div
                  onClick={() => openLinkToExplorer(splToken?.value || "")}
                  className="bg-base-200 rounded-lg p-4 flex flex-row gap-2 cursor-pointer"
                  style={{ color: colors[i] }}
                >
                  <img
                    className="w-6 h-6 cursor-pointer self-center"
                    src={splToken?.icon}
                  />
                  <div>{splToken?.label}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="w-full h-full max-h-[450px]">
          <Line
            ref={lineGraphRef}
            options={{
              responsive: true,
              aspectRatio: isMobile ? 1 : 2,
              plugins: {
                tooltip: {
                  mode: "index",
                  intersect: false,
                },
                title: {
                  display: true,
                  text: "Net Revenue",
                  align: "start",
                  fullSize: true,
                  padding: 12,
                  color: "white",
                  font: {
                    size: isMobile ? 16 : 24,
                    weight: "bold",
                  },
                },
              },
              hover: {
                mode: "nearest",
                intersect: false,
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: "Date",
                    color: "#fff",
                    font: {
                      size: isMobile ? 8 : 18,
                      weight: "bold",
                    },
                  },
                },
              },
            }}
            data={{
              labels: sortedDates.map((s) =>
                Math.abs(differenceInDays(startDate, endDate)) < 4
                  ? new Date(s).toLocaleTimeString()
                  : new Date(s).toLocaleDateString()
              ),
              datasets:
                data?.revenueByToken.map((rev, i) => ({
                  data: rev.times
                    .sort(
                      (a, b) =>
                        new Date(a.time).getTime() - new Date(b.time).getTime()
                    )
                    .map((time) => time.sum),
                  yAxisID: `y${i}`,
                  label: `${
                    splTokens.find((t) => t.value === rev._id)?.label
                  } Revenue`,
                  borderColor: colors[i],
                  backgroundColor: colors[i],
                  pointStyle: false,
                  tension: 0.5,
                  type: "line",
                })) || [],
            }}
          />
        </div>
      </div>
    </div>
  );
};
