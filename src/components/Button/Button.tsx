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
        <div
            className="button__default"
            onClick={handleClick}
            style={{
                ...style,
                backgroundColor: bgColor || '',
                color: textColor || '',
                opacity: disabled ? '.3' : '',
                cursor: disabled ? 'not-allowed' : '',
                padding: 0,
                width: '4.7rem',
                height: '4.7rem',
                animation: animate ? 'playbutton 1.2s infinite' : '',
            }}
        >
            <img src={svg} alt="Button" className='button__svg' />
        </div>
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