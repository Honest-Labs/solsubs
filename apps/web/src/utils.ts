export const ENV = import.meta.env.VITE_REST_ENVIRONMENT;

export const terms = [
  {
    value: "oneSecond",
    label: "One Second",
  },
  {
    value: "thirtySeconds",
    label: "Thirty Seconds",
  },
  {
    value: "oneWeek",
    label: "One Week",
  },
  {
    value: "thirtyDays",
    label: "Thirty Days",
  },
  {
    value: "oneYear",
    label: "One Year",
  },
];

// TODO: add prod tokens;
export const splTokens = [
  {
    label: "USDC",
    value: "Hn5zWLAdzFmP6uiJySdSqiPwYdSJgzCvsWLMVuCbkGzB",
    decimals: 9,
    icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=026",
    color: "#2774CA",
  },
  {
    label: "DUST",
    value: "8zr1SVsbYy12jA88WxAEh5kB24538vtKEUDw5Z1FcGNr",
    decimals: 9,
    icon: "https://dustprotocol.com/favicon.svg",
    color: "#00EDFF",
  },
];

export const openLinkToExplorer = (account: string, isTx = false) => {
  window.open(
    `https://solana.fm/${isTx ? "tx" : "address"}/${account}${
      !isTx ? "/anchor-account" : ""
    }?cluster=${ENV === "prod" ? "mainnet-qn1" : "devnet-qn1"}`
  );
};
