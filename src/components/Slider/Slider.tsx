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
    showLevel?: boolean
    onReset?: () => void
    reset?: boolean
}

export default function Slider({ value, handleChange, orientation, scale, label, showLevel, onReset, reset }: Props) {
    return (
        <div className="slider__container" style={{
            transform: orientation === 'v' ? `rotate(-90deg) scale(${scale || 1})` : `scale(${scale || 1})`
        }}>
            {onReset ?
                <div className="slider__reset">
                    <button className="slider__reset-btn" onClick={onReset} style={{ backgroundColor: reset ? '#289a28' : '' }}/>
                </div>
                : ''}
            {showLevel ?
                <div className="slider__level">
                    <p className="slider__level-number">0</p>
                    <p className="slider__level-number">1</p>
                    <p className="slider__level-number">2</p>
                    <p className="slider__level-number">3</p>
                    <p className="slider__level-number">4</p>
                    <p className="slider__level-number">5</p>
                    <p className="slider__level-number">6</p>
                    <p className="slider__level-number">7</p>
                    <p className="slider__level-number">8</p>
                    <p className="slider__level-number">9</p>
                    <p className="slider__level-number">10</p>
                </div>
                : ''}
            <input
                type="range"
                value={value * 100}
                className='slider__input'
                onChange={handleChange}
            />
            {showLevel ?
                <div className="slider__level">
                    <p className="slider__level-number">0</p>
                    <p className="slider__level-number">1</p>
                    <p className="slider__level-number">2</p>
                    <p className="slider__level-number">3</p>
                    <p className="slider__level-number">4</p>
                    <p className="slider__level-number">5</p>
                    <p className="slider__level-number">6</p>
                    <p className="slider__level-number">7</p>
                    <p className="slider__level-number">8</p>
                    <p className="slider__level-number">9</p>
                    <p className="slider__level-number">10</p>
                </div>
                : ''}
        </div>
    )
}