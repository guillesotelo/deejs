import React from 'react'
import InputRange, { Range } from 'react-input-range';
import "react-input-range/lib/css/index.css";

type Props = {
    // max: number
    // min: number
    // step: number
    value: number
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    orientation?: string
    scale?: number
}

export default function Slider({ value, handleChange, orientation, scale }: Props) {
    return (
        <div className="slider__container" style={{
            transform: orientation === 'v' ? `rotate(-90deg) scale(${scale || 1})` : `scale(${scale || 1})`
        }}>
            <h4 className="slider__label"></h4>
            <input
                type="range"
                value={value * 100}
                className='slider__input'
                onChange={handleChange}
            />
        </div>
    )
}