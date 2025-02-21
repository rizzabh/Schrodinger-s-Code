"use client";

import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { useParams, usePathname, useRouter } from "next/navigation"; // Use 'next/navigation' in App Router
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { db } from "../../../firebaseConfig";
export function TriggerTab() {
  const id = useParams();
  const [isIdValid, setIsIdValid] = useState(false);
  const [requests, setRequests] = useState([]);
  const router = useRouter();
  const path = usePathname();
  

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
    if(path!=`/admin`){
      console.log("id",id)
      setIsIdValid(true);
    }
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Requests</h2>
      {isIdValid ? (
        <></>
      ) : (
        <Table >
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="font-semibold text-gray-700">Sr. No</TableHead>
            <TableHead className="font-semibold text-gray-700">Organization Name</TableHead>
            <TableHead className="font-semibold text-gray-700">Amount (INR)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request, index) => (
            <TableRow
              key={request.id}
              className="border-b border-gray-200 cursor-pointer hover:bg-gray-100"
              onClick={() => router.push(`/admin/${request.id}`)} // Navigate to details page
            >
              <TableCell className="py-3">{index + 1}</TableCell>
              <TableCell className="py-3">{request.orgName || "N/A"}</TableCell>
              <TableCell className="py-3">₹{request.amount?.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table> )}
    </div>
  );
}