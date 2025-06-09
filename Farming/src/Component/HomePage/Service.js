import React from 'react'
import { advantages } from '../../Data/advatage'
import Card from '../Common/Card'

const Service = () => {
    return (
        <div>
            <div className=" mx-auto p-4 flex justify-center">

                <h1 className="text-3xl md:text-4xl font-bold">
                    ADVANTAGES OF{' '}
                    <span className="text-green-500">SMART FARMING</span>
                </h1>
            </div>
            <div className='flex flex-wrap justify-center'>
            {
                advantages.map((item,index)=>(
                    <Card
                     key={index}
                     imageUrl={item.src}
                     Title={item.title}
                     Desc={item.description}/>
                ))
            }
            </div>


        </div>
    )
}

export default Service