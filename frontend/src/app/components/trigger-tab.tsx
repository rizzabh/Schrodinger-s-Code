"use client";

import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation"; // Use 'next/navigation' in App Router
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"

import { db } from "../../../firebaseConfig";
export function TriggerTab() {
  const [requests, setRequests] = useState([]);
  const router = useRouter();


  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Trigger")); // Fetch from Firestore
        const requestData = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Document ID
          ...doc.data(), // Spread other document data
        }));
        setRequests(requestData);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div className="bg-black p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-50">Requests</h2>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-900">
            <TableHead className="font-semibold text-gray-50">Sr. No</TableHead>
            <TableHead className="font-semibold text-gray-50">Organization Name</TableHead>
            <TableHead className="font-semibold text-gray-50">Amount (INR)</TableHead>
            <TableHead className="font-semibold text-gray-50">Status </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request, index) => (
            <TableRow
              key={request.id}
              className="border-b border-zinc-950 cursor-pointer hover:bg-gray-900 text-white"
              onClick={() => router.push(`/Org/${request.id}`)} // Navigate to details page
            >
              <TableCell className="py-3">{index + 1}</TableCell>
              <TableCell className="py-3">{request.orgName || "N/A"}</TableCell>
            
              <TableCell className="py-3">₹{request.amount?.toLocaleString()}</TableCell>
                <TableCell className="py-3">{request.amount < 10000 ? "Accepted" : "Pending"}</TableCell>

            </TableRow>

          ))}
        </TableBody>
      </Table>
    </div>
  );
}