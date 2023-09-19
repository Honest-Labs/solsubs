import { Dispatch, FC, SetStateAction, useState } from "react";

interface Props {
  label: string;
  type?: string;
  value: string | number;
  setValue: Dispatch<SetStateAction<string>> | Dispatch<SetStateAction<number>>;
}

export const Input: FC<Props> = ({ label, type, value, setValue }) => {
  return (
    <div className="form-control w-full max-w-xs">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <input
        type={type || "text"}
        value={value}
        onChange={(e) => setValue(e.target.value as any)}
        className="input input-bordered w-full max-w-xs"
      />
    </div>
  );
};
