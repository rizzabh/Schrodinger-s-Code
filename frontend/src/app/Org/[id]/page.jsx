"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";

export default function OrganizationDetails() {
  const { id } = useParams(); // Get ID from URL
  const [request, setRequest] = useState(null);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Trigger"));
        const data = querySnapshot.docs.find(doc => doc.id === id);
        setRequest(data?.data() || null);
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    if (id) fetchRequest();
  }, [id]);

  if (!request) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    
    <div className="max-w-4xl mx-auto p-8 bg-[rgb(229,231,235)]/20 text-white rounded-lg shadow-xl ">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{request.orgName}</h2>
          <p className="text-lg text-gray-600">{request.orgType}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold text-blue-600">₹{request.amount?.toLocaleString()}</p>
          <p className="text-gray-500">Requested Amount</p>
        </div>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-2 gap-6 border-b pb-6">
        <div>
          <p className="text-lg font-semibold text-gray-800">Email:</p>
          <p className="text-gray-600">{request.email}</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-800">Reason for Funds:</p>
          <p className="text-gray-600">{request.reason}</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-800">Wallet Address:</p>
          <p className="text-gray-600">{request.wallet}</p>
        </div>
      </div>

      {/* Image Grid Section */}
      {request.imageUrl && (
        <div className="mt-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Uploaded Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="w-full h-40 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                <img
                  src={request.imageUrl}
                  alt="Uploaded"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
