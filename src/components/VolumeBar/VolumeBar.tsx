import React, { useEffect, useState } from 'react'

type Props = {
    level: number
}

export default function VolumeBar({ level }: Props) {
    const [db, setDb] = useState(-100)

    useEffect(() => {
        setDb(level)
    }, [level])

    const getLevel = (level: number) => {
        if (level === -Infinity) return 0
        if (level === Infinity) return 5

        if (level > -30 && level <= -10) return 1
        if (level > -10 && level <= -9) return 2
        if (level > -9 && level <= -8) return 3
        if (level > -8 && level <= -7) return 4
        if (level > -7) return 5
        return 0
    }

    return (
        <div className="volumebar__container">
            <div className="volumebar__vumeter">

                <div
                    className={
                        `volumebar__bar ${db > -2 ? 'volumebar__bar-red' : ''}`
                    }>
                </div>
                <div
                    className={
                        `volumebar__bar ${db > -5 ? 'volumebar__bar-red' : ''}`
                    }>
                </div>


                <div
                    className={
                        `volumebar__bar ${db > -7 ? 'volumebar__bar-orange' : ''}`
                    }>
                </div>
                <div
                    className={
                        `volumebar__bar ${db > -8 ? 'volumebar__bar-orange' : ''}`
                    }>
                </div>
                <div
                    className={
                        `volumebar__bar ${db > -9 ? 'volumebar__bar-orange' : ''}`
                    }>
                </div>
                <div
                    className={
                        `volumebar__bar ${db > -10 ? 'volumebar__bar-orange' : ''}`
                    }>
                </div>

                <div
                    className={
                        `volumebar__bar ${db > -11 ? 'volumebar__bar-green' : ''}`
                    }>
                </div>
                <div
                    className={
                        `volumebar__bar ${db > -12 ? 'volumebar__bar-green' : ''}`
                    }>
                </div>
                <div
                    className={
                        `volumebar__bar ${db > -13 ? 'volumebar__bar-green' : ''}`
                    }>
                </div>
                <div
                    className={
                        `volumebar__bar ${db > -14 ? 'volumebar__bar-green' : ''}`
                    }>
                </div>
                <div
                    className={
                        `volumebar__bar ${db > -15 ? 'volumebar__bar-green' : ''}`
                    }>
                </div>
                <div
                    className={
                        `volumebar__bar ${db > -20 ? 'volumebar__bar-green' : ''}`
                    }>
                </div>
                <div
                    className={
                        `volumebar__bar ${db > -22 ? 'volumebar__bar-green' : ''}`
                    }>
                </div>
                <div
                    className={
                        `volumebar__bar ${db > -24 ? 'volumebar__bar-green' : ''}`
                    }>
                </div>
                <div
                    className={
                        `volumebar__bar ${db > -30 ? 'volumebar__bar-green' : ''}`
                    }>
                </div>
            </div>
        </div>
    )
}