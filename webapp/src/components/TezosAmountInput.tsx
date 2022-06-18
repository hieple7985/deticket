import axios from "axios";
import { FC, useEffect, useState } from "react";
import TezosIconImg from "../assets/images/tezos-icon.png";

interface TezosAmountInputProps extends React.HTMLProps<HTMLInputElement> {
  // currency: string;
}

const DollarUSLocale = Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});

export const TezosAmountInput: FC<TezosAmountInputProps> = ({
  ...props
}) => {
  const [rate, setRate] = useState(0);

  useEffect(() => {
    axios
      .get("https://min-api.cryptocompare.com/data/price?fsym=XTZ&tsyms=USD")
      .then((res) => {
        setRate(res.data.USD);
      });
  });

  const estimatedUsd = rate * parseFloat((props.value as string) || '0')

  return (
    <div className="w-full">
      <div className="mt-1 flex rounded-md shadow-sm relative">
        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
          <img src={TezosIconImg} className="w-5 h-5 rounded-full" alt="Tezos" />
        </span>
        <input
          type="text"
          {...props}
          className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 disabled:bg-gray-100"
        />
        <div className="absolute right-4 text-gray-500 pt-2 text-sm">
          ~ ${DollarUSLocale.format(estimatedUsd)}
        </div>
      </div>
    </div>
  );
};
