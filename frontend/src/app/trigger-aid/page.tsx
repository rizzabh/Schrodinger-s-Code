"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import "../../../firebaseConfig";
import { getFirestore, addDoc, collection } from "firebase/firestore";
import ProjectCard from "../components/work/ProjectCard";
import { projects, ProjectProps } from "../components/work/projectDetails";
import MapComponent from "../components/turf";

export default function Page() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [geolocation, setGeolocation] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [db, setDb] = useState(null);

  // Ensure Firestore is initialized on client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setDb(getFirestore());
    }
  }, []);

  const onSubmit = async (data) => {
    if (!geolocation) {
      alert("Please fetch geolocation");
      return;
    }
    if (!imageUrl) {
      alert("Please upload an image");
      return;
    }
    if (!db) {
      alert("Firestore is not initialized");
      return;
    }

    const formData = { ...data, geolocation, imageUrl };
    console.log("Form Data:", formData);

    try {
      await addDoc(collection(db, "Trigger"), formData);
      alert("Form submitted successfully");
      reset();
      setGeolocation(null);
      setImageUrl("");
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

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "schrodinger"); // Replace with your Cloudinary preset

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dwl0u1dqd/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (data.secure_url) {
        setImageUrl(data.secure_url);
        alert("Image uploaded successfully");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Image upload failed");
      setImageUrl("");
    } finally {
      setUploading(false);
    }
  };
type Data ={
  id: number;
  name: string;
  description: string;
  technologies: string[]; 
  techNames: string[];
  techLinks: string[];
  github: string;
  demo: string;
  image: string;
  available: boolean;
}
const data=[
  {
          id: 0,
          name: "Portfolio 2023",
          description:
              "This is the fifth iteration of my portfolio.",
          technologies: [""],
          techNames: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Framer Motion"],
          techLinks: ["https://www.typescriptlang.org/", "https://reactjs.org/", "https://nextjs.org/", "https://tailwindcss.com/", "https://www.framer.com/motion/"],
          github: "https://github.com/nuIIpointerexception/www.seekvisualartist.com",
          demo: "https://www.seekvisualartist.com/",
          image: "/projects/portfolio.webp",
          available: true,
      },
    ]

  return (
    <div className="flex w-full">
      <div className="w-1/2">
      <MapComponent />

      </div>

    <div className="grid w-[90%] grid-cols-1 grid-rows-2 gap-y-10 gap-x-6 lg:max-w-[1200px] lg:grid-cols-1">
 
      <div className="bg-black p-5">
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-4">Fund Request Form</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Organization Name */}
            <div>
              <label className="block text-gray-700">Organization Name</label>
              <input
                {...register("orgName", { required: "Organization Name is required" })}
                className="w-full p-2 border rounded"
              />
              {errors.orgName && <p className="text-red-500">{errors.orgName.message}</p>}
            </div>

            {/* Organization Type */}
            <div>
              <label className="block text-gray-700">Organization Type</label>
              <select
                {...register("orgType", { required: "Organization Type is required" })}
                className="w-full p-2 border rounded"
              >
                <option value="">Select</option>
                <option value="NGO">NGO</option>
                <option value="Government">Government</option>
                <option value="Private">Private</option>
              </select>
              {errors.orgType && <p className="text-red-500">{errors.orgType.message}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-gray-700">Email Address</label>
              <input
                {...register("email", {
                  required: "Valid email is required",
                  pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: "Invalid email format" },
                })}
                className="w-full p-2 border rounded"
              />
              {errors.email && <p className="text-red-500">{errors.email.message}</p>}
            </div>

            {/* Amount Requested */}
            <div>
              <label className="block text-gray-700">Amount Requested (INR)</label>
              <input
                type="number"
                {...register("amount", { required: "Amount is required" })}
                className="w-full p-2 border rounded"
              />
              {errors.amount && <p className="text-red-500">{errors.amount.message}</p>}
            </div>

            {/* Reason for Funds */}
            <div>
              <label className="block text-gray-700">Reason for Funds</label>
              <textarea
                {...register("reason", { required: "Reason is required" })}
                className="w-full p-2 border rounded"
              ></textarea>
              {errors.reason && <p className="text-red-500">{errors.reason.message}</p>}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-gray-700">Upload Image</label>
              <input type="file" accept="image/*" onChange={uploadImage} className="w-full p-2 border rounded" />
              {uploading && <p className="text-blue-500">Uploading...</p>}
              {imageUrl && <img src={imageUrl} alt="Uploaded" className="mt-2 w-32 h-32 object-cover rounded" />}
            </div>

            {/* Wallet Address */}
            <div>
              <label className="block text-gray-700">Ethereum/Wallet Address</label>
              <input
                {...register("walletAddress")}
                className="w-full p-2 border rounded"
                placeholder="Optional"
              />
            </div>

            {/* Fetch Geolocation */}
            <button type="button" onClick={fetchGeolocation} className="bg-blue-500 text-white px-4 py-2 rounded">
              Fetch Geolocation
            </button>
            {geolocation && (
              <p className="text-green-500">Location: {geolocation.latitude}, {geolocation.longitude}</p>
            )}

            {/* Submit Button */}
            <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
}
