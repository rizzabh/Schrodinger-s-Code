"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import { BsBack } from "react-icons/bs";
import NewsGrid from "../../components/news/page";

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@tiplink/wallet-adapter-react-ui';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

export default function OrganizationDetails() {


  const { id } = useParams(); // Get ID from URL
  const [request, setRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [txStatus, setTxStatus] = useState('');
  const wallet = useWallet();
  const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=a95e3765-35c7-459e-808a-9135a21acdf6");

  useEffect(() => {
    // Check if this is the first load
    const hasLoaded = localStorage.getItem('hasLoadedBefore');
    
    if (!hasLoaded) {
      // Set the flag in localStorage
      localStorage.setItem('hasLoadedBefore', 'true');
      // Reload the page
      window.location.reload();
    }

    // Set a timer to remove the flag after 10 seconds
    const timer = setTimeout(() => {
      localStorage.removeItem('hasLoadedBefore');
    }, 10000); // 10 seconds

    // Cleanup the timer if component unmounts
    return () => clearTimeout(timer);
  }, []);
  
  // Helper function to convert INR to lamports
  const convertINRToLamports = (inrAmount) => {
    const solPrice = 14790; // INR per SOL
    const solAmount = Number(inrAmount) / solPrice;
    const lamports = Math.floor(solAmount * LAMPORTS_PER_SOL);
    return lamports;
  };


  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Trigger"));
        const data = querySnapshot.docs.find(doc => doc.id === id);
        setRequest(data?.data() || null);
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    if (id) fetchRequest();
  }, [id]);

  const handleTransaction = async () => {
    if (!wallet.connected || !request) {
      setTxStatus('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      setTxStatus('Preparing transaction...');

      const lamports = convertINRToLamports(request.amount);
      console.log(lamports )
      // Create transaction with transfer instruction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: new PublicKey(request.wallet),
          lamports: lamports,
        })
      );

      // Get latest blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      // Send transaction
      const signed = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      
      // Wait for confirmation
      await connection.confirmTransaction(signature);
      
      setTxStatus('Transaction successful!');
      
    } catch (error) {
      console.error('Transaction failed:', error);
      setTxStatus(`Transaction failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };


  if (!request) return <p className="text-center text-white">Loading...</p>;

  return (
    <div className="grid grid-cols-2 p-10 gap-5">
      
    <div className="w-full mx-auto p-8 bg-[rgb(229,231,235)]/20 text-white rounded-lg shadow-xl ">
      {/* Header Section */}
      <BsBack className="text-2xl text-white cursor-pointer" onClick={() => window.location="/admin"} />
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold text-white">{request.orgName}</h2>
          <p className="text-lg text-white">{request.orgType}</p>
        </div>
        <div className="text-right">
            <p className="text-xl font-semibold text-blue-600">₹{request.amount?.toLocaleString()}</p>
            <p className="text-sm text-gray-300">
              (~{(Number(request.amount) / 14790).toFixed(4)} SOL)
            </p>
            <p className="text-white">Requested Amount</p>
          </div>
      </div>

         {/* Wallet Connection and Transaction Section */}
         <div className="mb-6 border-b pb-6">
          <div className="flex flex-col items-center gap-4">
            <WalletMultiButton className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" />
            
            {wallet.connected && (
              <button
                onClick={handleTransaction}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full max-w-md"
              >
                {isLoading ? 'Processing...' : 'Approve & Send Funds'}
              </button>
            )}
            
            {txStatus && (
              <p className={`text-center ${txStatus.includes('failed') ? 'text-red-500' : 'text-green-500'}`}>
                {txStatus}
              </p>
            )}
          </div>
        </div>

      {/* Details Section */}
      <div className="grid grid-cols-2 gap-6 border-b pb-6">
        <div>
          <p className="text-lg font-semibold text-white">Email:</p>
          <p className="text-white">{request.email}</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-white">Reason for Funds:</p>
          <p className="text-white">{request.reason}</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-white">Wallet Address:</p>
          <p className="text-white">{request.wallet}</p>
        </div>
      </div>

      {/* Image Grid Section */}
      {request.imageUrl && (
        <div className="mt-6">
          <h3 className="text-2xl font-bold text-white mb-4">Uploaded Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
           
              <div  className="w-full h-72 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                <img
                  src={request.imageUrl}
                  alt="Uploaded"
                  className="w-full h-full object-cover"
                />
              </div>

          </div>
        </div>
      )}
    </div>
      <div className="w-full mx-auto p-8 bg-[rgb(229,231,235)] text-white rounded-lg shadow-xl ">
      <NewsGrid city={request.orgName} />
      </div>
    </div>
  );
}
