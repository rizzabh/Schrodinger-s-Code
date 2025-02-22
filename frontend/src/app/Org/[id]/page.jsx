"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import { BsBack } from "react-icons/bs";
import NewsGrid from "../../components/news/page";

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

  if (!request) return <p className="text-center text-white">Loading...</p>;

  return (
    <div className="grid grid-cols-2 p-10 gap-5">
      
    <div className="w-full mx-auto p-8 bg-[rgb(229,231,235)]/20 text-white rounded-lg shadow-xl ">
      {/* Header Section */}
      <BsBack className="text-2xl text-white cursor-pointer" onClick={() => window.location="/admin"} />
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold text-white">{request.orgName}</h2>
          <p className="text-lg text-white">{request.orgType}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold text-blue-600">₹{request.amount?.toLocaleString()}</p>
          <p className="text-white">Requested Amount</p>
        </div>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-2 gap-6 border-b pb-6">
        <div>
          <p className="text-lg font-semibold text-white">Email:</p>
          <p className="text-white">{request.email}</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-white">Reason for Funds:</p>
          <p className="text-white">{request.reason}</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-white">Wallet Address:</p>
          <p className="text-white">{request.wallet}</p>
        </div>
      </div>

      {/* Image Grid Section */}
      {request.imageUrl && (
        <div className="mt-6">
          <h3 className="text-2xl font-bold text-white mb-4">Uploaded Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
           
              <div  className="w-full h-72 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                <img
                  src={request.imageUrl}
                  alt="Uploaded"
                  className="w-full h-full object-cover"
                />
              </div>

          </div>
        </div>
      )}
    </div>
      <div className="w-full mx-auto p-8 bg-[rgb(229,231,235)] text-white rounded-lg shadow-xl ">
      <NewsGrid city={request.orgName} />
      </div>
    </div>
  );
}
