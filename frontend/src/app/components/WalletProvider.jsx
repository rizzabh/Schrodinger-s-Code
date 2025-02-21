'use client'
import React, { useMemo } from 'react';
import { useSearchParams } from "next/navigation";
import { WalletProvider } from '@solana/wallet-adapter-react';
import { TipLinkWalletAdapter } from "@tiplink/wallet-adapter";
import {
    WalletModalProvider,
    TipLinkWalletAutoConnectV2
} from '@tiplink/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';


// Change this line to destructure children properly
export const Wallet = ({ children }) => {
    const wallets = useMemo(
        () => [
            /**
             * Use TipLinkWalletAdapter here
             * Include the name of the dApp in the constructor
             * Pass the client id that the TipLink team provides
             * Choose from "dark", "light", "system" for the theme
             */
            new TipLinkWalletAdapter({ 
                title: "Schrodingers cat", 
                clientId: "f7d3033a-a221-42e2-b8cb-0b73c1bc3c27",
                theme: "dark"  // pick between "dark"/"light"/"system"
            }),
        ],
        []
    );
    const searchParams = useSearchParams();
    return (
      <WalletProvider wallets={wallets} autoConnect>
        <TipLinkWalletAutoConnectV2
          isReady
          query={searchParams}
        >
          <WalletModalProvider>
            {children}
          </WalletModalProvider>
        </TipLinkWalletAutoConnectV2>
      </WalletProvider>
    );
};

export default Wallet;