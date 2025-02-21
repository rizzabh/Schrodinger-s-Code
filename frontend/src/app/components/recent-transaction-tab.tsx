import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const transactions = [
  { id: 1, gramPanchayat: "Gram Panchayat 1", amount: 5000, date: "2023-04-01" },
  { id: 2, gramPanchayat: "Gram Panchayat 2", amount: 7500, date: "2023-04-02" },
  { id: 3, gramPanchayat: "Gram Panchayat 3", amount: 6000, date: "2023-04-03" },
]

const chartData = [
  { name: "Jan", total: 1000 },
  { name: "Feb", total: 1500 },
  { name: "Mar", total: 2000 },
  { name: "Apr", total: 2500 },
]

export function RecentTransactionTab() {
  const totalDisbursed = transactions.reduce((sum, t) => sum + t.amount, 0)
  const totalLeft = 50000 - totalDisbursed // Assuming a total budget of 50,000

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Disbursed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalDisbursed.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Left</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₹{totalLeft.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800">Transaction Overview</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value}`}
              />
              <Bar dataKey="total" fill="#4CAF50" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Recent Transactions</h3>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="font-semibold text-gray-700">ID</TableHead>
              <TableHead className="font-semibold text-gray-700">Gram Panchayat</TableHead>
              <TableHead className="font-semibold text-gray-700">Amount</TableHead>
              <TableHead className="font-semibold text-gray-700">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id} className="border-b border-gray-200">
                <TableCell className="py-3">{transaction.id}</TableCell>
                <TableCell className="py-3">{transaction.gramPanchayat}</TableCell>
                <TableCell className="py-3">₹{transaction.amount.toLocaleString()}</TableCell>
                <TableCell className="py-3">{transaction.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

