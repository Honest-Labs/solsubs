import { useWallet } from "@solana/wallet-adapter-react";
import { FC, useEffect, useRef, useState } from "react";
import { getProgram, useProvider } from "../program";
import { Input } from "../components/Input";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getMint } from "@solana/spl-token";
import { BN, utils } from "@project-serum/anchor";
import { splTokens, terms } from "../utils";

interface Props {
  refetch: () => Promise<any>;
}

export const CreatePlanModal: FC<Props> = ({ refetch }) => {
  const modal = useRef<HTMLDialogElement>();
  const { provider } = useProvider()!;
  const wallet = useWallet();
  const [code, setCode] = useState("");
  const [splToken, setSplToken] = useState(splTokens[0]);
  const [price, setPrice] = useState(10);
  const [term, setTerm] = useState(terms[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      <label htmlFor="my_modal" className="btn btn-primary">
        Create Plan
      </label>
      <input type="checkbox" id="my_modal" className="modal-toggle" />
      <dialog id="create_plan_modal" className="modal" ref={modal as any}>
        <div className="modal-box max-w-[800px] w-[90%] m-auto bg-gray-950">
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
                  value={term.label}
                  onChange={(e) =>
                    setTerm(terms.find((t) => t.label === e.target.value)!)
                  }
                >
                  {terms.map((t) => (
                    <option value={t.label} key={t.label}>
                      {t.label}
                    </option>
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
              disabled={loading}
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
                setLoading(true);
                // we get the token account for the user?
                try {
                  console.log(term.value);
                  const createPlanTx = await program.methods
                    .createPlan({
                      code,
                      price: new BN(price * 10 ** mint.decimals),
                      termInSeconds: new BN(term.value),
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
                    provider.connection
                  );
                  // There is a smarter way to do this, but this should be ok for now;
                  await new Promise((resolve) => setTimeout(resolve, 4000));
                  await refetch();
                  document.getElementById("my_modal")?.click();
                  console.log(ret);
                } catch (e) {
                  setError("There was a problem processing your transaction");
                  console.log(e);
                }
                setLoading(false);
              }}
            >
              {loading ? "Loading..." : "Submit"}
            </button>
          </form>
        </div>
        <label className="modal-backdrop" htmlFor="my_modal">
          Close
        </label>
      </dialog>
    </>
  );
};
