import React from 'react'

type Props = {
    // max: number
    // min: number
    // step: number
    value: number
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    orientation?: string
    scale?: number
    label?: string | number
}

export default function Slider({ value, handleChange, orientation, scale, label }: Props) {
    return (
        <div className="slider__container" style={{
            transform: orientation === 'v' ? `rotate(-90deg) scale(${scale || 1})` : `scale(${scale || 1})`
        }}>
            {label || label === 0 ? <h4 className="slider__label">{label}</h4> : ''}
            <input
                type="range"
                value={value * 100}
                className='slider__input'
                onChange={handleChange}
            />
        </div>
    )
}