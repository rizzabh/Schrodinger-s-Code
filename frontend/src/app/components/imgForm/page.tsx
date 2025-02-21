"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { storage } from "../../../../firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export default function FundRequestForm() {
  const { register, handleSubmit } = useForm();
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);


  // Handle Image Selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImageFiles(event.target.files);
    }
  };

  const uploadImage = async (e) => {
    handleFileInputChange(e);

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "schrodinger"); // Replace with your Cloudinary upload preset

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dwl0u1dqd/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      const newImageUrl = data.secure_url;
   
    } catch (err) {
      console.error("Error uploading image: ", err);
    }
  };
  // Upload Images to Firebase
  const uploadImages = async () => {
    if (!imageFiles || imageFiles.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const imageFile = imageFiles[i];
      const storageRef = ref(storage, `fundRequests/${imageFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          null,
          (error) => reject(error),
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            uploadedUrls.push(downloadURL);
            resolve();
          }
        );
      });
    }

    setImageUrls(uploadedUrls);
    setUploading(false);
  };

  // Handle Form Submission
  const onSubmit = async (data: any) => {
    await uploadImages();
    console.log("Form Data:", { ...data, images: imageUrls });
    alert("Form submitted successfully!");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Fund Request Form</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register("orgName")} className="border p-2 w-full" placeholder="Organization Name" required />

        <textarea {...register("purpose")} className="border p-2 w-full" placeholder="Purpose of Funds" required />

        {/* Image Upload Field */}
        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="border p-2 w-full" />

        {/* Upload Status */}
        {uploading && <p className="text-blue-500">Uploading Images...</p>}

        {/* Preview Uploaded Images */}
        <div className="flex flex-wrap gap-2">
          {imageUrls.map((url, index) => (
            <img key={index} src={url} alt="Uploaded" className="w-20 h-20 object-cover rounded" />
          ))}
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Submit
        </button>
      </form>
    </div>
  );
}

function handleFileInputChange(e: any) {
  throw new Error("Function not implemented.");
}
