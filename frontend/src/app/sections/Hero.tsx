import { motion } from "framer-motion";
import Logo from "../components/svg/Logo";
import HeroBackground from "../components/background/HeroBackground";
import React from "react";
import ConnectWallet from "../components/ConnectWallet";
const Hero = () => {
    return (
        <motion.div
            className="relative z-10 flex h-[100vh] w-full justify-center"
            id="home"
            initial="initial"
            animate="animate"
        >
            <HeroBackground />
            <div className="mt-10 flex flex-col items-center justify-center sm:mt-0">
                <div
                    className={`relative flex gap-4 items-center justify-center pointer-events-none mb-6`}
                >
                    <Logo width={100} height={100} /> <span className="text-white font-bold text-9xl">GovBlock</span>
                </div>
                <ConnectWallet />
            </div>
        </motion.div>
    );
};

export default Hero;
