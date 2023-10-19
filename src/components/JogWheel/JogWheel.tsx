import React from 'react'
import Wheel from '../../assets/icons/wheel.svg'

type Props = {
  play: boolean
  loaded: any
}

export default function JogWheel({ play, loaded }: Props) {
  return (
    <div className="jogwheel__container">
      <img
        src={Wheel}
        alt="Wheel"
        className={`jogwheel__svg${play ? '--playing' : ''}`}
        style={{
          filter: loaded ?
            'invert(12%) sepia(45%) saturate(2849%) hue-rotate(172deg) brightness(91%) contrast(103%)'
            : ''
        }}
      />
    </div>
  )
}