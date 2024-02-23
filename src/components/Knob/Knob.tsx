import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Draggable from 'gsap/Draggable'
gsap.registerPlugin(Draggable)

interface KnobProps {
    label?: string
    setValue?: (rotation: number) => void
}

const Knob: React.FC<KnobProps> = ({ label, setValue }) => {
    const maxRotation = 150
    const minRotation = -150
    const volumeTickWidth = 0.05
    let volume: HTMLDivElement | null = null
    const wheelRef = useRef<SVGSVGElement>(null)

    useEffect(() => {
        if (wheelRef.current) {
            const draggable = Draggable.create(wheelRef.current, {
                type: 'rotation',
                bounds: { minRotation, maxRotation },
                onDrag: () => {
                    if (setValue && draggable) {
                        setValue(draggable.rotation)
                    }
                }
            })[0]

            return () => {
                // Clean up Draggable instance
                if (draggable) {
                    draggable.kill()
                }
            }
        }
    }, [])

    return (
        <div className='knob__container'>
            <h4 className="knob__label">{label}</h4>
            <svg ref={wheelRef} className='knob__svg' id='wheel' width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="40" stroke="gray" strokeWidth="2" fill="black" />
                <line x1="50" y1="50" x2="50" y2="10" stroke="lightgray" strokeWidth="3" />
            </svg>
        </div>
    )
}

export default Knob
