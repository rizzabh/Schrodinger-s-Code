import React from 'react'
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";

import MapComponent from '../components/turf'
const page = () => {
  return (
    <div>
      <div className='w-full absolute mt-4'>
      <div className='relative flex items-center gap- border-green-900 border text-green-400 text-center px-4 py-2 bg-green-600 bg-opacity-10 w-fit mx-auto rounded-full backdrop-blur-sm'>
      <IoCheckmarkDoneCircleSharp className='text-xl' />
Tracking your realtime transaction and reiumbursing the aid, please wait patiently</div>
      </div>
      <MapComponent />
    </div>
  )
}

export default page
