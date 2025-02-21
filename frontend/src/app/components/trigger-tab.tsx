import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

const requests = [
  { id: 1, gramPanchayat: "Gram Panchayat 1", amount: 10000 },
  { id: 2, gramPanchayat: "Gram Panchayat 2", amount: 15000 },
  { id: 3, gramPanchayat: "Gram Panchayat 3", amount: 12000 },
]

export function TriggerTab() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Requests</h2>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="font-semibold text-gray-700">Sr. No</TableHead>
            <TableHead className="font-semibold text-gray-700">Gram Panchayat Name</TableHead>
            <TableHead className="font-semibold text-gray-700">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id} className="border-b border-gray-200">
              <TableCell className="py-3">{request.id}</TableCell>
              <TableCell className="py-3">{request.gramPanchayat}</TableCell>
              <TableCell className="py-3">₹{request.amount.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

