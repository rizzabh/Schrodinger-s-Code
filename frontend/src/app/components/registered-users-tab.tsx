"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

const users = [
  { id: 1, name: "Gram Panchayat 1", type: "Gram Panchayat" },
  { id: 2, name: "NGO 1", type: "NGO" },
  { id: 3, name: "Private Company 1", type: "Private" },
  { id: 4, name: "Gram Panchayat 2", type: "Gram Panchayat" },
  { id: 5, name: "NGO 2", type: "NGO" },
  { id: 6, name: "Private Company 2", type: "Private" },
]

export function RegisteredUsersTab() {
  const [filter, setFilter] = useState("All")

  const filteredUsers = filter === "All" ? users : users.filter((user) => user.type === filter)

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Registered Users</h2>
      <div className="mb-6">
        <Select onValueChange={setFilter} defaultValue="All">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Gram Panchayat">Gram Panchayat</SelectItem>
            <SelectItem value="NGO">NGO</SelectItem>
            <SelectItem value="Private">Private</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="font-semibold text-gray-700">ID</TableHead>
            <TableHead className="font-semibold text-gray-700">Name</TableHead>
            <TableHead className="font-semibold text-gray-700">Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id} className="border-b border-gray-200">
              <TableCell className="py-3">{user.id}</TableCell>
              <TableCell className="py-3">{user.name}</TableCell>
              <TableCell className="py-3">{user.type}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

