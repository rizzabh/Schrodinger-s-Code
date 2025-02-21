"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import "../../../firebaseConfig";
import { getFirestore, addDoc, collection } from "firebase/firestore";
import MapComponent from "../components/turf1";
import CircleWallet from "../components/CircleWallet";
import { usePathname } from "next/navigation";

export default function Page() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [geolocation, setGeolocation] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const db = getFirestore();

  const onSubmit = async (data) => {
    if (!geolocation) {
      alert("Please fetch geolocation");
      return;
    }
    const formData = { ...data, geolocation, imageUrl };
    try {
      await addDoc(collection(db, "Trigger"), formData);
      alert("Form submitted successfully");
      reset();
      setGeolocation(null);
      setImageUrl(null);
    } catch (error) {
      console.error("Error saving document:", error);
      alert("Error submitting form");
    }
  };

  const fetchGeolocation = () => {
    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeolocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => alert("Geolocation permission denied!")
      );
    } else {
      alert("Geolocation not supported");
    }
  };


  return (
    <div className="flex gap-0 justify-center items-center min-h-screen bg-zinc-900">
            <CircleWallet />

      <div className="w-1/3 h-[90vh] rounded-xl border border-zinc-600 shadow-xl m-4 scale-[97%] overflow-hidden  max-md:hidden ">
        {" "}
        <MapComponent />
      </div>
      <div className="max-w-3xl w-full p-8 bg-zinc-900/0 text-white rounded-2xl shadow-lg">
        <h2 className="text-5xl max-sm:text-3xl font-semibold text-gray-200 mb-4 relative flex items-center">
          Fund Request Form 
          <span className="absolute left-0 w-3 h-3 bg-gray-500 rounded-full animate-ping"></span>
        </h2>
        <p className="text-gray-400 mb-6">
          Submit your request and get assistance.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Organization Name
              </label>
              <input
                {...register("orgName", {
                  required: "Organization Name is required",
                })}
                className="w-full p-3 bg-zinc-900 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-gray-500"
              />
              {errors.orgName && (
                <p className="text-red-500 text-sm">{errors.orgName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Organization Type
              </label>
              <select
                {...register("orgType", {
                  required: "Organization Type is required",
                })}
                className="w-full p-3 bg-zinc-900 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-gray-500"
              >
                <option value="">Select</option>
                <option value="NGO">NGO</option>
                <option value="Government">Government</option>
                <option value="Private">Private</option>
              </select>
              {errors.orgType && (
                <p className="text-red-500 text-sm">{errors.orgType.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Email Address
            </label>
            <input
              {...register("email", {
                required: "Valid email is required",
                pattern: {
                  value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                  message: "Invalid email format",
                },
              })}
              className="w-full p-3 bg-zinc-900 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-gray-500"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Amount Requested (INR)
            </label>
            <input
              type="number"
              {...register("amount", { required: "Amount is required" })}
              className="w-full p-3 bg-zinc-900 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-gray-500"
            />
            {errors.amount && (
              <p className="text-red-500 text-sm">{errors.amount.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Reason for Funds
            </label>
            <textarea
              {...register("reason", { required: "Reason is required" })}
              className="w-full p-3 bg-zinc-900 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-gray-500"
            />
            {errors.reason && (
              <p className="text-red-500 text-sm">{errors.reason.message}</p>
            )}
          </div>
          <div className="flex gap-6">
          <button
            type="button"
            onClick={fetchGeolocation}
            className="w-full bg-gray-700 text-white p-3 rounded-lg hover:bg-gray-600"
          >
            Fetch Geolocation
          </button>
          {geolocation && (
            <p className="text-green-500 text-sm">
              Location: {geolocation.latitude}, {geolocation.longitude}
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-white text-black font-semibold p-3 rounded-lg hover:bg-gray-600"
          >
            Submit
          </button>
          </div>
         
        </form>
      </div>
    </div>
  );
}
