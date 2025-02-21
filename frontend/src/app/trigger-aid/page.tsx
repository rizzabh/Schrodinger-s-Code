"use client";
import React, { useEffect } from 'react';
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import MapComponent from '../components/turf';

const Page = () => {

  return (
    <div className='flex items-center justify-center h-screen w-full '>
      <div className="w-6/12">

      <div className='w-6/12 absolute mt-4'>
        <div className='relative flex items-center gap-2 border-green-900 border text-green-400 text-center px-4 py-2 bg-green-600 bg-opacity-10 w-fit mx-auto rounded-full backdrop-blur-sm'>
          <IoCheckmarkDoneCircleSharp className='text-xl' />
          Tracking your realtime transaction and reimbursing the aid, please wait patiently
        </div>
      </div>
      <MapComponent />
      </div>
      <div className='w-6/12'>
        Hello
      </div>

    </div>
  );
};

export default Page;
