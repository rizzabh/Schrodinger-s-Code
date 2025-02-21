
'use client'
import { useState } from 'react';
import QRCode from 'react-qr-code';
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
 
function ReclaimDemo() {

  // State to store the verification request URL
  const [requestUrl, setRequestUrl] = useState('');
  const [proofs, setProofs] = useState([]);
 
  const getVerificationReq = async () => {

    // Your credentials from the Reclaim Developer Portal
    // Replace these with your actual credentials

    const APP_ID = '0x5d98315693FA6a9121772ea9Eaf6A5020FdE5791';
    const APP_SECRET = '0x311dd0b148c9a79e0dc63451b1251911ec9d9b6b87a2327af4b6599b3dc769b8';
    const PROVIDER_ID = '32d72564-cae8-4d36-af4b-1b5b95d7a116';
 
    // Initialize the Reclaim SDK with your credentials
    const reclaimProofRequest = await ReclaimProofRequest.init(APP_ID, APP_SECRET, PROVIDER_ID);
 
    // Generate the verification request URL
    const requestUrl = await reclaimProofRequest.getRequestUrl();

    console.log('Request URL:', requestUrl);

    setRequestUrl(requestUrl);
 
    // Start listening for proof submissions
    await reclaimProofRequest.startSession({

      // Called when the user successfully completes the verification
      onSuccess: (proofs) => {

        console.log('Verification success', proofs);
        setProofs(proofs);

        // Add your success logic here, such as:
        // - Updating UI to show verification success
        // - Storing verification status
        // - Redirecting to another page
      },
      // Called if there's an error during verification
      onError: (error) => {

        console.error('Verification failed', error);
 
        // Add your error handling logic here, such as:
        // - Showing error message to user
        // - Resetting verification state
        // - Offering retry options
      },
    });
  };
 
  return (
    <div className='h-[900px] bg-white'>
      <button onClick={getVerificationReq}>Get Verification Request</button>

      {/* Display QR code when URL is available */}

      {requestUrl && (
        <div style={{ margin: '20px 0' }}>
          <QRCode value={requestUrl} />
        </div>
      )}

      {proofs && (
        <div>
          
          <pre>{JSON.stringify(proofs, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
 
export default ReclaimDemo;
