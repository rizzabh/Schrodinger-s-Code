export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import BigNumber from "bignumber.js";
import secret from "./joon7qDhq3TtrozZnc3TVEoEUmyFGbYtjwzP83UksJv.json";

// Configure BigNumber
BigNumber.config({
  DECIMAL_PLACES: 9,
  ROUNDING_MODE: BigNumber.ROUND_HALF_UP,
});

// Utility function for error logging
function logError(context, error) {
  console.error(
    `[ERROR] ${context}:`,
    error instanceof Error ? error.message : String(error)
  );
}

// Validate Solana address
function isValidSolanaAddress(address) {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

// Function to retry getting latest blockhash
async function getLatestBlockhashWithRetry(connection, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const { blockhash, lastValidBlockHeight } = 
        await connection.getLatestBlockhash('finalized');
      return { blockhash, lastValidBlockHeight };
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error("Failed to get blockhash after multiple attempts");
}

// Function to send and confirm transaction with retry
async function sendAndConfirmTransactionWithRetry(connection, transaction, signers, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Get fresh blockhash for each attempt
      const { blockhash, lastValidBlockHeight } = 
        await getLatestBlockhashWithRetry(connection);
      
      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight;

      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        signers,
        {
          commitment: 'confirmed',
          maxRetries: 3,
          skipPreflight: false,
        }
      );
      
      return signature;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error("Failed to send transaction after multiple attempts");
}

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { receiverAddress, amount } = body;

    // Input validation
    if (!receiverAddress || !amount) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    if (!isValidSolanaAddress(receiverAddress)) {
      return NextResponse.json(
        { error: "Invalid Solana address" },
        { status: 400 }
      );
    }

    // Validate amount
    const solAmount = new BigNumber(amount);
    if (solAmount.isNaN() || solAmount.isLessThanOrEqualTo(0)) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Connect to Solana with longer timeout
    const endpoint = "https://devnet.helius-rpc.com/?api-key=a95e3765-35c7-459e-808a-9135a21acdf6";
    const connection = new Connection(endpoint, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000, // 60 seconds
    });

    // Initialize sender from secret
    const sender = Keypair.fromSecretKey(new Uint8Array(secret));
    const receiver = new PublicKey(receiverAddress);

    // Convert SOL to lamports
    const lamports = solAmount.multipliedBy(LAMPORTS_PER_SOL).integerValue().toNumber();

    // Check sender balance with retry
    let balance;
    try {
      balance = await connection.getBalance(sender.publicKey);
    } catch (error) {
      logError("Balance Check", error);
      return NextResponse.json(
        { error: "Failed to check balance" },
        { status: 500 }
      );
    }

    if (balance < lamports) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Create transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: sender.publicKey,
        toPubkey: receiver,
        lamports,
      })
    );

    // Send transaction with retry logic
    const signature = await sendAndConfirmTransactionWithRetry(
      connection,
      transaction,
      [sender]
    );

    return NextResponse.json({
      success: true,
      signature,
      amount: solAmount.toString(),
      receiver: receiverAddress,
    });

  } catch (error) {
    logError("SOL Transfer", error);
    return NextResponse.json(
      {
        error: "Transfer failed",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}