import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useRef, useState } from "react";
import { getProgram, useProvider } from "../program";
import { Input } from "../components/Input";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getMint } from "@solana/spl-token";
import { BN, utils } from "@project-serum/anchor";

const terms = [
  {
    value: "oneSecond",
    label: "One Second",
  },
  {
    value: "thirtySeconds",
    label: "Thirty Second",
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
const splTokens = [
  {
    label: "Fake",
    value: "Abgycx9WAxgyXsiSf51T4LhdRxjWahfN9wNKNEe8LiGP",
  },
];

export const CreatePlanModal = () => {
  const modal = useRef<HTMLDialogElement>();
  const { provider } = useProvider()!;
  const wallet = useWallet();
  const [code, setCode] = useState("");
  const [splToken, setSplToken] = useState(splTokens[0]);
  const [price, setPrice] = useState(10);
  const [term, setTerm] = useState(terms.find((t) => t.value === "oneWeek")!);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
  }, [code, splToken, price]);

  const getMintInfo = async () => {
    try {
      console.log(splToken.value);
      if (PublicKey.isOnCurve(splToken.value)) {
        return getMint(provider.connection, new PublicKey(splToken.value));
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <button
        className="btn btn-primary"
        onClick={async () => {
          modal.current?.showModal();
        }}
      >
        Create Plan
      </button>
      <dialog id="create_plan_modal" className="modal" ref={modal as any}>
        <div className="modal-box max-w-[800px] w-[90%] m-auto">
          <h1 className="font-bold text-3xl">Create Plan</h1>
          <form className="flex flex-col gap-4 mt-4">
            <div className="flex flex-row flex-wrap justify-between w-full">
              <Input label="Unique Plan Code" setValue={setCode} value={code} />
              <div className="form-control w-full max-w-xs">
                <label className="label">
                  <span className="label-text">Term Length</span>
                </label>
                <select
                  className="select select-bordered w-full max-w-xs"
                  value={term.value}
                  onChange={(e) =>
                    setTerm(terms.find((t) => t.value === e.target.value)!)
                  }
                >
                  {terms.map((t) => (
                    <option value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-row flex-wrap justify-between w-full">
              <div className="form-control w-full max-w-xs">
                <label className="label">
                  <span className="label-text">SPL Token</span>
                </label>
                <select
                  className="select select-bordered w-full max-w-xs"
                  value={splToken.value}
                  onChange={(e) =>
                    setSplToken(
                      splTokens.find((t) => t.value === e.target.value)!
                    )
                  }
                >
                  {splTokens.map((t) => (
                    <option value={t.value}>
                      {t.label} {t.value.slice(0, 4)}****{t.value.slice(-4)}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                type="number"
                label="Term Price"
                setValue={setPrice}
                value={price}
              />
            </div>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <button
              type="button"
              className="btn btn-primary m-auto w-[350px] mt-8"
              onClick={async () => {
                if (!code) {
                  return setError("Code is required");
                }
                if (!splToken) {
                  return setError("SPL Token Address is required");
                }
                if (!price) {
                  return setError("Price is required");
                }
                const mint = await getMintInfo();
                if (!mint) {
                  return setError("Invalid SPL Token Address, Mint not found");
                }
                const program = await getProgram(provider);
                const [planAccount] = PublicKey.findProgramAddressSync(
                  [
                    Buffer.from(utils.bytes.utf8.encode("plan")),
                    wallet.publicKey!.toBuffer(),
                    Buffer.from(utils.bytes.utf8.encode(code)),
                  ],
                  program.programId
                );

                const associatedToken = getAssociatedTokenAddressSync(
                  mint.address,
                  planAccount,
                  true
                );
                // we get the token account for the user?
                const createPlanTx = await program.methods
                  .createPlan({
                    code,
                    price: new BN(price * 10 ** mint.decimals),
                    term: { [term.value]: {} },
                  })
                  .accounts({
                    payer: wallet.publicKey!,
                    planAccount: planAccount,
                    mintAccount: mint.address,
                    planTokenAccount: associatedToken,
                  })
                  .transaction();
                const ret = await wallet.sendTransaction(
                  createPlanTx,
                  provider.connection,
                  { skipPreflight: true }
                );
                console.log(ret);
              }}
            >
              Submit
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
};
