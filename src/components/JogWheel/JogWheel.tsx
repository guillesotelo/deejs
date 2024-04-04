import React from 'react'
import Wheel from '../../assets/icons/wheel_2.svg'

type Props = {
  play: boolean
  loaded: any
}

export default function JogWheel({ play, loaded }: Props) {
  return (
    <div className="jogwheel__container" style={{ border: loaded ? '3px solid #1d4d77' : '' }}>
      <div className="jogwheel__wheel-ring"
        style={{
          border: loaded ? '3px solid #1d4d77' : '',
          backgroundColor: loaded ? '#344350' : ''
        }}>
        <div className="jogwheel__wheel-wrapper">
          <img
            src={Wheel}
            alt="Wheel"
            className={`jogwheel__wheel${play ? '--playing' : ''}`}
            draggable={false}
          />
        </div>
      </div>
    </div>
  )
}