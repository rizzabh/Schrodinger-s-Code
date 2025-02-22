"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import "../../../firebaseConfig";
import { getFirestore, addDoc, collection } from "firebase/firestore";
import MapComponent from "../components/turf1";
import MapComponentSubmit from "../components/turf";
import axios from "axios";
import { convertSolToInr, convertInrToSol } from "../../../soltoinr";
import { Keypair } from "@solana/web3.js";
import { PiCoinVerticalDuotone } from "react-icons/pi";

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
  DialogDescription,
} from "@headlessui/react";
import { useWallet } from "@solana/wallet-adapter-react";

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
  const [signature, setSignature] = useState(null);
  const db = getFirestore();
  const [mumbai, setMumbai] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    // Check if this is the first load
    const hasLoaded = localStorage.getItem("hasLoadedBefore");

    if (!hasLoaded) {
      // Set the flag in localStorage
      localStorage.setItem("hasLoadedBefore", "true");
      // Reload the page
      window.location.reload();
    }

    // Set a timer to remove the flag after 10 seconds
    const timer = setTimeout(() => {
      localStorage.removeItem("hasLoadedBefore");
    }, 10000); // 10 seconds

    // Cleanup the timer if component unmounts
    return () => clearTimeout(timer);
  }, []);
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    toast.promise(
      async () => {
        if (!geolocation) {
          throw new Error("Please fetch geolocation");
        }

        const formData = {
          ...data,
          geolocation,
          imageUrl,
          status: "pending",
          createdAt: new Date(),
        };
        const requestedAmount = parseFloat(data.amount);

        try {
          // Always save form data to Firestore
          const docRef = await addDoc(collection(db, "Trigger"), formData);

          // Check if requested amount is less than 1000 INR
          if (requestedAmount < 10000) {
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
              requestId: docRef.id, // Pass document ID for reference
            });

            if (response.status === 200) {
              setSignature(response.data.signature);
              await updateDoc(collection(db, "Trigger", docRef.id), {
                status: "approved",
                transactionHash:
                  response.data.signature || response.data.txHash,
                processedAt: new Date(),
              });

              return response.data;
            } else {
              // throw new Error("Form submitted but automatic processing failed");
            }
          } else {
            // For larger requests, just submit the form without calling automation
            return "Form submitted successfully. Request will be reviewed.";
          }
        } catch (error) {
          // If we have a document reference, update status to "declined" on error
          if (error.docRef) {
            try {
              await updateDoc(collection(db, "Trigger", error.docRef.id), {
                status: "declined",
                errorMessage: error.message,
                processedAt: new Date(),
              });
            } catch (updateError) {
              console.error("Error updating declined status:", updateError);
            }
          }

          // console.error("Error processing request:", error);
          // throw new Error("Error submitting form");
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
        error: (error) => error.message,
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConfirm = () => {
    setIsModalOpen(false);
    console.log("Creating GoFundMe token...");
    // Replace this with your actual token creation logic
  };

  const { publicKey, signTransaction, connected } = useWallet();
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
    twitter: "",
    telegram: "",
    website: "",
    amount: 1,
    slippage: 10,
    priorityFee: 0.0005,
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [txSignature, setTxSignature] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
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
              {...register("wallet", {
                required: "Wallet address is required",
              })}
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
          <div
            className="py-2 px-4 text-md cursor-pointer flex font-semibold items-center gap-2 rounded-full bg-gradient-to-b from-white to-zinc-400 text-black w-fit"
            onClick={() => setIsModalOpen(true)}
          >
            <PiCoinVerticalDuotone />
            Create Token (Optional)
          </div>
          <ConsentModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleConfirm}
          />
          {geolocation && (
            <p className="text-green-500 text-sm">
              Location: {geolocation.latitude}, {geolocation.longitude}
            </p>
          )}
          <div className="text-green-500 text-sm flex mx-auto">{signature}</div>
        </form>
      </div>
    </div>
  );
}

// import { useState } from "react";
// import { useWallet } from "@solana/wallet-adapter-react";
// import { Keypair } from "@solana/web3.js";
// import {
//   Dialog,
//   DialogPanel,
//   DialogTitle,
//   DialogDescription,
// } from "@headlessui/react";

const ConsentModal = ({ isOpen, onClose }) => {
  const { publicKey, signTransaction, connected } = useWallet();

  const [formState, setFormState] = useState({
    name: "",
    symbol: "",
    description: "",
    twitter: "",
    telegram: "",
    website: "",
    image: "",
    amount: 0.01,
    slippage: 10,
    priorityFee: 0.0005,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!connected || !publicKey) {
      console.error("Please connect your wallet first");
      return;
    }

    try {
      const mintKeypair = Keypair.generate();

      const response = await fetch("https://pumpportal.fun/api/trade-local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicKey: publicKey.toString(),
          action: "create",
          tokenMetadata: {
            name: formState.name,
            symbol: formState.symbol,
            uri: formState.image,
          },
          mint: mintKeypair.publicKey.toString(),
          denominatedInSol: "true",
          amount: formState.amount,
          slippage: formState.slippage,
          priorityFee: formState.priorityFee,
          pool: "pump",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate transaction");
      }
      const txData = await response.arrayBuffer();
      const tx = (
        await import("@solana/web3.js")
      ).VersionedTransaction.deserialize(new Uint8Array(txData));

      tx.sign([mintKeypair]);
      const signedTx = await signTransaction(tx);

      const connection = new (await import("@solana/web3.js")).Connection(
        "https://mainnet.helius-rpc.com/?api-key=fb5ef076-69e7-4d96-82d8-2237c13aef7a",
        "confirmed"
      );
      const signature = await connection.sendRawTransaction(
        signedTx.serialize()
      );
      //log whole response in console
      console.log("Transaction response:", response);
      console.log("Transaction signature:", signature);
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 flex items-center justify-center bg-black/60"
    >
      <DialogPanel className="bg-[#1E1E1E] p-6 rounded-lg shadow-lg max-w-[40rem] border border-gray-700">
        <DialogTitle className="text-lg font-semibold text-white">
          Create a GoFundMe Token?
        </DialogTitle>
        <DialogDescription className="mt-2 text-sm text-gray-400">
          Enter token details manually:
        </DialogDescription>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 gap-6 flex">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Token Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Token name: Disaster/Event"
              value={formState.name}
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
            />
            <label className="block text-sm font-medium text-gray-300">
              Symbol
            </label>
            <input
              type="text"
              name="symbol"
              placeholder="Symbol (e.g., ABCD)"
              value={formState.symbol}
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
            />
            <label className="block text-sm font-medium text-gray-300">
              Description
            </label>
            <input
              type="text"
              name="description"
              placeholder="Description"
              value={formState.description}
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
            />
            <label className="block text-sm font-medium text-gray-300">
              Twitter (optional)
            </label>
            <input
              type="text"
              name="twitter"
              placeholder="Twitter (optional)"
              value={formState.twitter}
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
            />
            <label className="block text-sm font-medium text-gray-300">
              Telegram (optional)
            </label>
            <input
              type="text"
              name="telegram"
              placeholder="Telegram (optional)"
              value={formState.telegram}
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Website (optional)
            </label>
            <input
              type="text"
              name="website"
              placeholder="Website (optional)"
              value={formState.website}
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
            />
            <label className="block text-sm font-medium text-gray-300">
              Amount (default: 1)
            </label>
            <input
              type="number"
              name="amount"
              placeholder="Amount (default: 1)"
              value={formState.amount}
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
            />
            <label className="block text-sm font-medium text-gray-300">
              Slippage (default: 10)
            </label>
            <input
              type="number"
              name="slippage"
              placeholder="Slippage (default: 10)"
              value={formState.slippage}
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
            />
            <label className="block text-sm font-medium text-gray-300">
              Image URL (for token)
            </label>
            <input
              type="text"
              name="image"
              placeholder="Image URL (for token)"
              value={formState.image}
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
            />
            <label className="block text-sm font-medium text-gray-300">
              Priority Fee (default: 0.0005)
            </label>
            <input
              type="number"
              step="0.0001"
              name="priorityFee"
              placeholder="Priority Fee (default: 0.0005)"
              value={formState.priorityFee}
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 text-gray-400 border border-gray-600 rounded hover:bg-gray-700/50"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Yes, Create Token
              </button>
            </div>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
};
