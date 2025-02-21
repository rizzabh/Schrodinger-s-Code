'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import "../../../firebaseConfig";
import { getFirestore, addDoc, collection } from "firebase/firestore";

export default function Page() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [geolocation, setGeolocation] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const db = getFirestore();

  const onSubmit = async (data) => {
    if (!geolocation) {
      alert('Please fetch geolocation');
      return;
    }
    if (!imageUrl) {
      alert('Please upload an image');
      return;
    }

    const formData = { ...data, geolocation, imageUrl };
    console.log('Form Data:', formData);

    try {
      await addDoc(collection(db, "Trigger"), formData);
      alert('Form submitted successfully');
      reset();
      setGeolocation(null);
      setImageUrl('');
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Error submitting form');
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
        () => alert('Geolocation permission denied!')
      );
    } else {
      alert('Geolocation not supported');
    }
  };

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'schrodinger'); // Replace with your Cloudinary preset

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dwl0u1dqd/image/upload", {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setImageUrl(data.secure_url);
      alert("Image uploaded successfully");
    } catch (error) {
      console.error('Upload error:', error);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className='bg-black p-5'>
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-4">Fund Request Form</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-gray-700">Organization Name</label>
            <input {...register('orgName', { required: "Organization Name is required" })} className="w-full p-2 border rounded" />
            {errors.orgName && <p className="text-red-500">{errors.orgName.message}</p>}
          </div>

          <div>
            <label className="block text-gray-700">Organization Type</label>
            <select {...register('orgType', { required: "Organization Type is required" })} className="w-full p-2 border rounded">
              <option value="">Select</option>
              <option value="NGO">NGO</option>
              <option value="Government">Government</option>
              <option value="Private">Private</option>
            </select>
            {errors.orgType && <p className="text-red-500">{errors.orgType.message}</p>}
          </div>

          <div>
            <label className="block text-gray-700">Email Address</label>
            <input {...register('email', { required: "Valid email is required", pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: "Invalid email format" } })} className="w-full p-2 border rounded" />
            {errors.email && <p className="text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-gray-700">Amount Requested (INR)</label>
            <input type="number" {...register('amount', { required: "Amount is required" })} className="w-full p-2 border rounded" />
            {errors.amount && <p className="text-red-500">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="block text-gray-700">Reason for Funds</label>
            <textarea {...register('reason', { required: "Reason is required" })} className="w-full p-2 border rounded"></textarea>
            {errors.reason && <p className="text-red-500">{errors.reason.message}</p>}
          </div>

          <div>
            <label className="block text-gray-700">Upload Image</label>
            <input type="file" accept="image/*" onChange={uploadImage} className="w-full p-2 border rounded" />
            {uploading && <p className="text-blue-500">Uploading...</p>}
            {imageUrl && <img src={imageUrl} alt="Uploaded" className="mt-2 w-32 h-32 object-cover rounded" />}
          </div>

          <div>
            <label className="block text-gray-700">Ethereum/Wallet Address</label>
            <input {...register('walletAddress')} className="w-full p-2 border rounded" placeholder="Optional" />
          </div>

          <button type="button" onClick={fetchGeolocation} className="bg-blue-500 text-white px-4 py-2 rounded">
            Fetch Geolocation
          </button>
          {geolocation && <p className="text-green-500">Location: {geolocation.latitude}, {geolocation.longitude}</p>}

          <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">Submit</button>
        </form>
      </div>
    </div>
  );
}
