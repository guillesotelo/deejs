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
    animate?: boolean
}

export default function Button({ label, handleClick, className, bgColor, textColor, disabled, svg, style, animate }: Props) {
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
                animation: animate ? 'playbutton 1.2s infinite' : '',
            }}
        >
            <img
                src={svg}
                alt="Button"
                className='button__svg'
                style={{
                    filter: animate ? 'invert(58%) sepia(41%) saturate(6140%) hue-rotate(86deg) brightness(114%) contrast(119%)' : ''
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
                animation: animate ? 'playbutton 1.2s infinite' : '',
            }}
            disabled={disabled}
        >
            {label || ''}
        </button>

}