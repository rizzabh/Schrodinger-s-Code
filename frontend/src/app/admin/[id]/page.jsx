"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import { usePathname } from "next/navigation";
export default function OrganizationDetails() {


  const { id } = useParams(); // Get ID from URL
  const [request, setRequest] = useState(null);
  const [isIdValid, setIsIdValid] = useState(false);
  useEffect(() => {
    const fetchRequest = async () => {
      try {
  const querySnapshot = await getDocs(collection(db, "Trigger"));
     const data = querySnapshot.docs.find(doc => doc.id == id);
        setRequest(data.data());
        console.log(data);
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    if (id) fetchRequest();
  }, [id]);

  if (!request) return <p className="text-center text-gray-500">Loading...</p>;


  return (
    <div className=" mx-auto p-8 bg-white text-black rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-4">Organization Details</h2>
      <div className="space-y-4">
        <p><strong>Organization Name:</strong> {request.orgName}</p>
        <p><strong>Organization Type:</strong> {request.orgType}</p>
        <p><strong>Email:</strong> {request.email}</p>
        <p><strong>Amount Requested:</strong> ₹{request.amount?.toLocaleString()}</p>
        <p><strong>Reason for Funds:</strong> {request.reason}</p>
        <p><strong>Wallet Address:</strong> {request.wallet}</p>
        {request.imageUrl && (
          <div>
            <p><strong>Uploaded Image:</strong></p>
            <img src={request.imageUrl} alt="Uploaded" className="w-48 h-48 object-cover rounded-md" />
          </div>
        )}
      </div>
    </div>
  );
}