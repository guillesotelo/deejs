import React from 'react'

type Props = {
    level: number
}

export default function VolumeBar({ level }: Props) {

    const getLevel = (level: number) => {
        if (level === -Infinity) return 0
        if (level === Infinity) return 5

        if (level > -30 && level <= -13) return 1
        if (level > -13 && level <= -10) return 2
        if (level > -10 && level <= -8) return 3
        if (level > -8 && level <= -6) return 4
        if (level > -6) return 5
        return 0
    }

    return (
        <div className="volumebar__container">
            <div className="volumebar__vumeter">
                <div
                    className={
                        `volumebar__bar ${getLevel(level) > 4 ? 'volumebar__bar-5' : ''}`
                    }>
                </div>
                <div
                    className={
                        `volumebar__bar ${getLevel(level) > 3 ? 'volumebar__bar-4' : ''}`
                    }>
                </div>
                <div
                    className={
                        `volumebar__bar ${getLevel(level) > 2 ? 'volumebar__bar-3' : ''}`
                    }>
                </div>
                <div
                    className={
                        `volumebar__bar ${getLevel(level) > 1 ? 'volumebar__bar-2' : ''}`
                    }>
                </div>
                <div
                    className={
                        `volumebar__bar ${getLevel(level) > 0 ? 'volumebar__bar-1' : ''}`
                    }>
                </div>
            </div>
        </div>
    )
}