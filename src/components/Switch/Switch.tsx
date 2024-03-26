import React from 'react'

type Props = {
    label?: string
    on?: string
    off?: string
    value: boolean
    setValue: (value: boolean) => void
    style?: React.CSSProperties
}

export default function Switch({ label, on, off, value, setValue, style }: Props) {
    return (
        <div
            className="switch__container"
            onClick={() => setValue(!value)}
            style={style}
        >
            {label ? <p className={`switch__label`}>{label}</p> : ''}
            <div
                className={`switch__row`}
                style={{
                    backgroundColor: value ? '#a4d8a4' : '',
                }}>
                <p className="switch__on">{on || 'ON'}</p>
                <p className={`switch__slider${value ? '--on' : '--off'}`} ></p>
                <p className="switch__off" >{off || 'OFF'}</p>
            </div>
        </div>
    )
}