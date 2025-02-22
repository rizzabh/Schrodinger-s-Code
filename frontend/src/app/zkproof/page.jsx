
'use client'

import { useState } from 'react';
import QRCode from 'react-qr-code';
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
 
function ReclaimDemo() {

  // State to store the verification request URL
  const [requestUrl, setRequestUrl] = useState('');
  const [proofs, setProofs] = useState(null);
 
  const getVerificationReq = async () => {

    // Your credentials from the Reclaim Developer Portal
    // Replace these with your actual credentials

    const APP_ID = '0x98Ae45d53950872727a2131a2338A97DD212E49E';
    const APP_SECRET = '0x6310195475c2bd93e5f788b42f4f7bbecb9b20e618a6f64ecc649f2a7bc6570c';
    const PROVIDER_ID = '2b22db5c-78d9-4d82-84f0-a9e0a4ed0470';
 
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
        window.location.href = '/trigger-aid';
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
    <div className='text-white flex gap-5'>
     {!requestUrl && (
        // <div className='' style={{ margin: '20px 0' , width:"20px" }}>
        //   <QRCode value={requestUrl} />
        // </div>
        <button onClick={getVerificationReq}>Kyc Yourself</button>
      )}
      {/* <button onClick={getVerificationReq}>Kyc Yourself</button> */}

      {/* Display QR code when URL is available */}

      {requestUrl && (
        <div className='absolute top-10' style={{ margin: '20px 0' , width:"20px" }}>
          <QRCode value={requestUrl} />
        </div>
      )}

      {proofs && (
        <div>

          <h2>Verification Successful!</h2>
          {/* <pre>{JSON.stringify(proofs, null, 2)}</pre> */}
        </div>
      )}
    </div>
  );
}
 
export default ReclaimDemo;
