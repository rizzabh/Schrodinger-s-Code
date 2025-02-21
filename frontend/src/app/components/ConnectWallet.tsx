"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import React from "react";

const ConnectWallet = () => {
  return (
    <div className="flex justify-center items-center mt-4">
      <WalletMultiButton className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:scale-105 transition-all" />
    </div>
  );
};

export default ConnectWallet;
