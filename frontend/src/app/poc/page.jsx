'use client'

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from "@tiplink/wallet-adapter-react-ui";
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { useState, useEffect } from 'react';

const TREASURY_WALLET = new PublicKey('joon7qDhq3TtrozZnc3TVEoEUmyFGbYtjwzP83UksJv');
const SOLANA_RPC = 'https://mainnet.helius-rpc.com/?api-key=1ebc2a4c-a8ae-4dd1-921f-00afdd5853a5';
const connection = new Connection(SOLANA_RPC);

export default function GovernmentDashboard() {
    // Use useWallet instead of useWalletModal
    const { publicKey, sendTransaction } = useWallet();
    const [balance, setBalance] = useState(0);
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        async function fetchBalance() {
            try {
                const balance = await connection.getBalance(TREASURY_WALLET);
                setBalance(balance / 1e9); // Convert from lamports to SOL
            } catch (err) {
                console.error('Error fetching balance:', err);
            }
        }
        fetchBalance();
    }, []);

    function requestFunds(amount, recipient) {
        setRequests([...requests, { amount, recipient, approved: false }]);
    }

    async function approveRequest(index) {
        if (!publicKey) return alert('Please connect your wallet first');
        
        const request = requests[index];
        try {
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey, // Use connected wallet as fromPubkey
                    toPubkey: new PublicKey(request.recipient),
                    lamports: Math.floor(request.amount * 1e9), // Convert SOL to lamports
                })
            );

            // Get latest blockhash
            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;

            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'confirmed');
            
            const updatedRequests = [...requests];
            updatedRequests[index].approved = true;
            setRequests(updatedRequests);
        } catch (err) {
            console.error('Transaction failed:', err);
            alert('Transaction failed: ' + err.message);
        }
    }

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold">Government Treasury</h1>
            <p>Balance: {balance} SOL</p>
            <WalletMultiButton />
            
            <h2 className="text-lg font-bold mt-4">Request Funds</h2>
            <button 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => requestFunds(1, '4iG4s2F3eSByCkMvfsGhrvzXNoPrDFUJuA7Crtuf3Pvn')}
            >
                Request 1 SOL
            </button>
            
            <h2 className="text-lg font-bold mt-4">Pending Requests</h2>
            {requests.map((req, i) => (
                <div key={i} className="p-2 border rounded mt-2">
                    <p>Recipient: {req.recipient}</p>
                    <p>Amount: {req.amount} SOL</p>
                    <button 
                        className={`px-4 py-2 rounded ${
                            req.approved 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                        onClick={() => approveRequest(i)} 
                        disabled={req.approved}
                    >
                        {req.approved ? 'Approved' : 'Approve'}
                    </button>
                </div>
            ))}
        </div>
    );
}