import React from 'react'

const Loading = ({text}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      {/* Spinner */}
      <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      {/* Loading Text */}
      <p className="text-gray-600">{text}</p>
    </div>
  )
}

export default Loading