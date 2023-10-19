import React from 'react'

type Props = {
    label: string
    on: string
    off: string
    value: boolean
    setValue: (value: boolean) => void
}

export default function Switch({ label, on, off, value, setValue }: Props) {
    return (
        <div className="switch__container" onClick={() => setValue(!value)}>
            {label ? <h4 className="switch__label">{label}</h4> : ''}
            <div className="switch__row" style={{
                backgroundColor: value ? '#e5f0e5' : '#e9d8d8',
            }}>
                <h4 className="switch__on">{on}</h4>
                <h4 className={`switch__slider${value ? '--on' : '--off'}`} >|||</h4>
                <h4 className="switch__off">{off}</h4>
            </div>
        </div>
    )
}