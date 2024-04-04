import React from 'react'

type Props = {
    label?: string
    className?: string
    bgColor?: string
    textColor?: string
    handleClick: () => any
    disabled?: boolean
    svg?: string
    style?: { [key: string | number]: any }
    pause?: boolean
    playing?: boolean
}

export default function Button({ label, handleClick, className, bgColor, textColor, disabled, svg, style, playing, pause }: Props) {
    return svg ?
        <button
            className="button__default"
            onClick={handleClick}
            style={{
                ...style,
                backgroundColor: bgColor || '',
                color: textColor || '',
                opacity: disabled ? '.3' : '',
                cursor: disabled ? 'not-allowed' : '',
                animation: pause ? 'playbutton 1.7s infinite' : '',
                border: playing ? '5px solid #00e400' : ''
            }}
        >
            <img
                src={svg}
                alt="Button"
                className='button__svg'
                style={{
                    filter: pause || playing ? 'invert(58%) sepia(41%) saturate(6140%) hue-rotate(86deg) brightness(114%) contrast(119%)' : ''
                }}
            />
        </button>
        :
        <button
            className={className || 'button__default'}
            onClick={handleClick}
            style={{
                ...style,
                backgroundColor: bgColor || '',
                color: textColor || '',
                opacity: disabled ? '.3' : '',
                cursor: disabled ? 'not-allowed' : '',
                animation: pause ? 'playbutton 1.7s infinite' : '',
                border: playing ? '5px solid #00e400' : ''
            }}
            disabled={disabled}
        >
            {label || ''}
        </button>

}