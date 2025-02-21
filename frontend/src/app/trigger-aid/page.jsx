"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import "../../../firebaseConfig";
import { getFirestore, addDoc, collection } from "firebase/firestore";
import MapComponent from "../components/turf1";
import MapComponentSubmit from "../components/turf";
import axios from "axios";
import { convertSolToInr, convertInrToSol } from "../../../soltoinr";
import { Toaster, toast } from "sonner";
import { set } from "lodash";

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
  const [mumbai, setMumbai] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    toast.promise(
      async () => {
        if (!geolocation) {
          throw new Error("Please fetch geolocation");
        }

        const formData = { ...data, geolocation, imageUrl };
        const requestedAmount = parseFloat(data.amount);

        try {
          // Always save form data to Firestore
          await addDoc(collection(db, "Trigger"), formData);

          // Check if requested amount is less than 1000 INR
          if (requestedAmount < 100000) {
            let solvalue = await convertInrToSol(requestedAmount);
            console.log(requestedAmount);
            console.log(solvalue, "solvale");
            console.log(data.wallet, "ji");
            console.log(
              {
                receiverAddress: `${data.wallet}`,
                amount: parseFloat(solvalue),
              },
              {
                receiverAddress: "rAhULHBrf2yGuANDuAGLuUTKuLCW17t86T8T6vGcuok",
                amount: parseFloat(solvalue),
              }
            );
            // Call automation API for small requests
            const response = await axios.post("/api/automation", {
              receiverAddress: `${data.wallet}`,
              amount: parseFloat(solvalue),
            });

            if (response.status === 200) {
              return "Small fund request processed automatically!";
            } else {
              throw new Error("Form submitted but automatic processing failed");
            }
          } else {
            // For larger requests, just submit the form without calling automation
            return "Form submitted successfully. Request will be reviewed.";
          }
        } catch (error) {
          console.error("Error processing request:", error);
          throw new Error("Error submitting form");
        } finally {
          // Reset form state
          reset();
          setGeolocation(null);
          setImageUrl(null);
          setIsSubmitting(false);
        }
      },
      {
        loading: "Please wait till we verify your information",
        success: (message) => message,
        error: (error) => error.message
      }
    );
  };
  
  const uploadImage = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "schrodinger"); // Replace with your Cloudinary upload preset

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dwl0u1dqd/image/upload", // Replace with your Cloudinary cloud name
        formData
      );
      setImageUrl(response.data.secure_url);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.warning("Image upload failed");
    }
  };

  const fetchGeolocation = () => {
    setMumbai(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeolocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => toast.warning("Geolocation permission denied!")
      );
    } else {
      toast.info("Geolocation not supported");
    }
  };

  return (
    <div className="flex gap-0 justify-center items-center min-h-screen bg-zinc-900">
      <div className="w-1/3 h-[90vh] rounded-xl border border-zinc-600 shadow-xl m-4 scale-[97%] overflow-hidden  max-md:hidden ">
        {" "}
        {mumbai ? <MapComponentSubmit /> : <MapComponent />}
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
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Wallet Address
            </label>
            <textarea
              {...register("wallet", { required: "Wallet address is required" })}
              className="w-full p-3 bg-zinc-900 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-gray-500"
            />
            {errors.wallet && (
              <p className="text-red-500 text-sm">{errors.wallet.message}</p>
            )}
          </div>
          <input
            type="file"
            onChange={uploadImage}
            className="w-full p-3 bg-zinc-900 border border-zinc-600 rounded-lg text-white"
          />
          {imageUrl && (
            <p className="text-green-500 text-sm">
              Image uploaded successfully
            </p>
          )}

          <div className="flex gap-6">
            <button
              type="button"
              onClick={fetchGeolocation}
              className="w-full bg-gray-700 text-white p-3 rounded-lg hover:bg-gray-600"
            >
              Fetch Geolocation
            </button>
            <button
              type="submit"
              disabled={!geolocation || isSubmitting}
              className={`w-full p-3 rounded-lg font-semibold ${
                !geolocation 
                  ? "bg-gray-500 text-gray-300 cursor-not-allowed" 
                  : isSubmitting
                    ? "bg-gray-400 text-black cursor-not-allowed"
                    : "bg-white text-black hover:bg-gray-600"
              }`}
            >
              {isSubmitting ? "Processing..." : "Submit"}
            </button>
          </div>
          {geolocation && (
            <p className="text-green-500 text-sm">
              Location: {geolocation.latitude}, {geolocation.longitude}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}