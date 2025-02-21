import React from "react";

const page = () => {
  const TransactionData = [
    {
      id: 1,
      from: "0x1234567890abcdef1234567890abcdef12345678",
      to: "0xabcdef1234567890abcdef1234567890abcdef12",
      amount: "1.5 ETH",
      timestamp: "2023-10-01T12:34:56Z",
    },
    {
      id: 2,
      from: "0xabcdef1234567890abcdef1234567890abcdef12",
      to: "0x1234567890abcdef1234567890abcdef12345678",
      amount: "0.75 ETH",
      timestamp: "2023-10-02T14:20:00Z",
    },
    {
      id: 3,
      from: "0x1234567890abcdef1234567890abcdef12345678",
      to: "0xabcdef1234567890abcdef1234567890abcdef12",
      amount: "2.0 ETH",
      timestamp: "2023-10-03T16:45:30Z",
    },
  ];
  return (
    <>
      <header>
        <div className="flex items-center h-16 p-4 justify-between gap-2">
          <div className="flex gap-2">
            <img src="/logo.svg" width={20} height={20} alt="" />{" "}
            <p className="text-xl font-medium text-white">GovBlock</p>
          </div>
          
          <p title="info" className="cursor-pointer text-white font-bold">How it works?</p>
        </div>
      </header>
      <div className="flex">
        {" "}
        <div className="text-white w-9/12 p-4 bg-zinc-900 m-4 rounded-xl h-[85vh]">
            <iframe
                src="https://jup.ag/tokens/HNeDkro4iFaHuFE3TmD5BkSsWqWsvhPuPAxd85bqpump"
                className="w-full h-full rounded-xl"
                title="Example Iframe"
            />
        </div>
        <div className="w-3/12 m-4 p-4 rounded-xl bg-zinc-900 border border-gray-800">
          <p className="text-xl text-zinc-600 font-medium">Transactions</p>
          <input
            type="text"
            className="px-4 py-2 mt-2 border-gray-500 w-full bg-black text-gray-400 border rounded-full"
            placeholder="Search Tokens"
          />
          <div className="flex flex-col gap-2 mt-4">
            {TransactionData.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-2 bg-zinc-800 rounded-lg overflow-clip"
              >
                <div>
                  <p className="text-sm text-gray-400">From</p>
                  <p className="text-sm text-white">{`${transaction.from.slice(
                    0,
                    6
                  )}...${transaction.from.slice(-4)}`}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">To</p>
                  <p className="text-sm text-white">{`${transaction.to.slice(
                    0,
                    6
                  )}...${transaction.to.slice(-4)}`}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Amount</p>
                  <p className="text-sm text-white">{transaction.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Timestamp</p>
                  <p className="text-sm text-white">
                    {new Date(transaction.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default page;
