import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Wallet, ArrowDownRight, ArrowUpRight, TrendingUp, Loader2 } from "lucide-react";
import * as web3 from '@solana/web3.js';
import { convertSolToInr, convertInrToSol } from "../../../soltoinr";

export  function RecentTransactionTab() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const walletAddress = "joon7qDhq3TtrozZnc3TVEoEUmyFGbYtjwzP83UksJv";
  const displayAddress = `${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 4)}`;
 
  useEffect(() => {
    async function fetchSolanaData() {
      try {
        // Connect to Solana devnet (or change to mainnet-beta for production)
        const connection = new web3.Connection(
          "https://mainnet.helius-rpc.com/?api-key=1ebc2a4c-a8ae-4dd1-921f-00afdd5853a5",
          'confirmed'
        );

        // Create a PublicKey object from wallet address
        const publicKey = new web3.PublicKey(walletAddress);

        // Fetch account balance
        const walletBalance = await connection.getBalance(publicKey);
        setBalance(walletBalance / web3.LAMPORTS_PER_SOL); // Convert lamports to SOL

        // Fetch recent transactions (last 20)
        const transactionList = await connection.getSignaturesForAddress(
          publicKey,
          { limit: 5 }
        );

        // Process transaction data
        const txnData = await Promise.all(
          transactionList.map(async (tx) => {
            const transactionDetails = await connection.getTransaction(tx.signature);
            
            // Skip if transaction details not available
            if (!transactionDetails) return null;
            
            // Determine if transaction is incoming or outgoing
            const postBalances = transactionDetails.meta?.postBalances || [];
            const preBalances = transactionDetails.meta?.preBalances || [];
            
            // Find index of our wallet in accounts
            const accountIndex = transactionDetails.transaction.message.accountKeys.findIndex(
              key => key.toString() === publicKey.toString()
            );
            
            // Calculate balance change
            const balanceChange = postBalances[accountIndex] - preBalances[accountIndex];
            const amountInSol = Math.abs(balanceChange) / web3.LAMPORTS_PER_SOL;
            
            // Get timestamp
            const blockTime = transactionDetails.blockTime;
            const date = blockTime ? new Date(blockTime * 1000).toISOString().split('T')[0] : 'Unknown';
            
            // Extract first 8 characters of signature as ID
            const id = tx.signature.substring(0, 8) + '...';
            
            return {
              id: id,
              signature: tx.signature,
              gramPanchayat: balanceChange > 0 ? "Funding Source" : "Grant Recipient",
              amount: await convertSolToInr(amountInSol), // Convert to INR (example rate)
              type: balanceChange > 0 ? "incoming" : "outgoing",
              date: date
            };
          })
        );

        // Filter out null values and set transactions
        const validTransactions = txnData.filter(tx => tx !== null);
        setTransactions(validTransactions);

        // Generate monthly chart data
        const monthMap = {};
        validTransactions.forEach(tx => {
          if (!tx.date || tx.date === 'Unknown') return;
          
          const month = tx.date.substring(5, 7); // Extract month from YYYY-MM-DD
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthName = monthNames[parseInt(month) - 1];
          
          if (!monthMap[monthName]) {
            monthMap[monthName] = { disbursed: 0, received: 0 };
          }
          
          if (tx.type === 'incoming') {
            monthMap[monthName].received += tx.amount;
          } else {
            monthMap[monthName].disbursed += tx.amount;
          }
        });
        
        const chartData = Object.keys(monthMap).map(month => ({
          name: month,
          disbursed: monthMap[month].disbursed,
          received: monthMap[month].received
        }));
        
        setMonthlyData(chartData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching Solana data:", error);
        setLoading(false);
        // Set fallback data for demo purposes if RPC fails
        setTransactions([
          { id: "7x2d9f...", signature: "7x2d9f...", gramPanchayat: "Gram Panchayat 1", amount: 5000, type: "outgoing", date: "2023-04-01" },
          { id: "3a1e8c...", signature: "3a1e8c...", gramPanchayat: "Gram Panchayat 2", amount: 7500, type: "outgoing", date: "2023-04-02" },
        ]);
      }
    }

    fetchSolanaData();
  }, [walletAddress]);

  // Calculate totals
  const totalDisbursed = transactions
    .filter(t => t.type === "outgoing")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalReceived = transactions
    .filter(t => t.type === "incoming")
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Convert SOL balance to INR (example rate)
  const balanceInr = parseFloat((balance * 86.75 * 170).toFixed(2));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
          <p className="mt-2 text-gray-600">Fetching blockchain data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Treasury Wallet Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Treasury Wallet</h2>
              <div className="flex items-center space-x-2">
                <Wallet size={16} />
                <span className="text-sm font-mono bg-white/10 px-2 py-1 rounded">{displayAddress}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-80">Current Balance</div>
              <div className="text-3xl font-bold">₹{balanceInr.toLocaleString()}</div>
              <div className="text-sm opacity-70">{balance.toFixed(4)} SOL</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Disbursed 
              <div className="text-xs">in last 30 days</div>
            </CardTitle>
            <ArrowUpRight className="text-rose-500" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">₹{totalDisbursed.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Received
              <div className="text-xs">in last 30 days</div>
            </CardTitle>
            <ArrowDownRight className="text-green-500" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalReceived.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Fund Utilization
              <div className="text-xs">percentage used</div>
            </CardTitle>
            <TrendingUp className="text-blue-500" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalReceived ? Math.round((totalDisbursed / totalReceived) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Monthly Activity</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value/1000}k`}
                  />
                  <Tooltip 
                    formatter={(value) => [`₹${value.toLocaleString()}`, '']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Bar dataKey="received" name="Received" fill="#4CAF50" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="disbursed" name="Disbursed" fill="#FF5722" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No monthly data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-2 h-12 rounded-full mr-3 ${t.type === "incoming" ? "bg-green-500" : "bg-rose-500"}`}></div>
                    <div>
                      <div className="font-medium">{t.gramPanchayat}</div>
                      <div className="text-sm text-gray-500">{t.date}</div>
                    </div>
                  </div>
                  <div className="font-semibold">
                    ₹{t.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Recent Transactions</h3>
        {transactions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="font-semibold text-gray-700">Transaction ID</TableHead>
                <TableHead className="font-semibold text-gray-700">Entity</TableHead>
                <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                <TableHead className="font-semibold text-gray-700">Type</TableHead>
                <TableHead className="font-semibold text-gray-700">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} className="border-b border-gray-200">
                  <TableCell className="py-3 font-mono text-sm">
                    <a 
                      href={`https://explorer.solana.com/tx/${transaction.signature}?cluster=devnet`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {transaction.id}
                    </a>
                  </TableCell>
                  <TableCell className="py-3">{transaction.gramPanchayat}</TableCell>
                  <TableCell className="py-3">₹{transaction.amount.toLocaleString()}</TableCell>
                  <TableCell className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.type === "incoming" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-rose-100 text-rose-800"
                    }`}>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="py-3">{transaction.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center p-8 text-gray-500">
            No transactions found
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentTransactionTab;