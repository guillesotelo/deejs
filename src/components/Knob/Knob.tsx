import React, { FormEventHandler, Ref, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Draggable from 'gsap/Draggable'
import { GeneralEventTypes } from 'wavesurfer.js/dist/event-emitter'
gsap.registerPlugin(Draggable)

interface KnobProps {
    label?: string
    value: number
    setValue?: (rotation: number) => void
    onReset?: () => void
    reset?: boolean
    max: number
    id?: string
}

const Knob: React.FC<KnobProps> = ({ label, setValue, onReset, reset, value, max, id }) => {
    const maxRotation = 150
    const minRotation = -150
    const wheelRef = useRef<SVGSVGElement>(null)
    const inputRef = useRef<any>(null)

    useEffect(() => {
        if (wheelRef.current) gsap.set(wheelRef.current, { rotation: value * max / 6 })
    }, [value])

    useEffect(() => {
        if (wheelRef.current) {
            const draggable = Draggable.create(wheelRef.current, {
                type: 'rotation',
                bounds: { minRotation, maxRotation },
                onDrag: () => {
                    if (setValue && draggable) {
                        const newValue = !draggable.rotation ? 0 : draggable.rotation / max * 6
                        setValue(newValue)
                        if (inputRef.current) {
                            // If you are reading this, I can explain...
                            inputRef.current.value = newValue
                            inputRef.current.dispatchEvent(new Event('change'))
                        }
                    }
                }
            })[0]

            return () => {
                if (draggable) draggable.kill()
            }
        }
    }, [])

    const resetValue = () => {
        if (onReset) onReset()
        if (setValue) setValue(0)
        if (inputRef.current) {
            inputRef.current.value = 0
            inputRef.current.dispatchEvent(new Event('change'))
        }
    }

    return (
        <div className='knob__container'>
            <div className="knob__reset">
                <button className="knob__reset-btn" onClick={resetValue} style={{ backgroundColor: reset ? '#289a28' : '' }} />
            </div>
            <div className="knob__col">
                <h4 className="knob__label">{label}</h4>
                <svg ref={wheelRef} className='knob__svg' id='wheel' width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="40" stroke="gray" strokeWidth="2" fill="black" />
                    <line x1="50" y1="50" x2="50" y2="10" stroke="lightgray" strokeWidth="3" />
                </svg>
            </div>

            <input type='range' min={-max} max={max} id={id} ref={inputRef} style={{ display: 'none'}} ></input>
        </div>
    )
}

export default Knob
