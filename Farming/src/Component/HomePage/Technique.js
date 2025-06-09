import React from 'react'
import Benifit from './Benifit'


const Technique = () => {
    return (
        <div className=" mx-auto p-4 flex justify-center flex-col items-center">

            <h1 className="text-3xl md:text-4xl font-bold text-green-500">
                Smart Farming{' '}
                <span className="text-black">Techniques</span>
            </h1>
            <div>
                <Benifit/>
            </div>
        </div>


    )
}

export default Technique