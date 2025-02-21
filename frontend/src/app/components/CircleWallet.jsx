import { WalletIcon } from "lucide-react";

const CircleWallet = () => {
  return (
    <div>
      <div className="wallet  rounded-full bg-zinc-800 p-4 border-zinc-600 border top-0 cursor-pointer w-fit absolute right-0 m-6">
        <WalletIcon className="text-white" />
      </div>
    </div>
  );
};

export default CircleWallet;
