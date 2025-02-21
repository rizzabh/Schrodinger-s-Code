import { motion } from "framer-motion";
import Logo from "../components/svg/Logo";
import HeroBackground from "../components/background/HeroBackground";
import React from "react";
import ConnectWallet from "../components/ConnectWallet";
import { WalletMultiButton } from "@tiplink/wallet-adapter-react-ui";

import SongBG from "../components/SongBg";
const Hero = () => {
    return (
        <motion.div
            className="relative z-10 flex h-[100vh] w-full justify-center"
            id="home"
            initial="initial"
            animate="animate"
        >
            {/* <SongBG /> */}
            <HeroBackground />
            <div className="mt-10 flex flex-col items-center justify-center sm:mt-0">
                <div
                    className={`relative flex gap-4 items-center justify-center pointer-events-none mb-6`}
                >
                    <Logo width={50} height={50} /> <span className="text-white font-bold text-9xl max-sm:text-3xl">GovBlock</span>
                </div>
                {/* <ConnectWallet /> */}

<WalletMultiButton

style={{
    background: "#A9F605",
    color: "black",
    borderRadius: "180px",
  }}
  className={`w-full py-3 rounded-lg font-medium transition-colors text-white bg-custom-green hover:bg-green-700
       border bg-custom-green hover:bg-green-600"
  }`}
  />
            </div>
        </motion.div>
    );
};

export default Hero;
