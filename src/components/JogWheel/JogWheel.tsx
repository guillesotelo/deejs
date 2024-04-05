import React from 'react'
import Wheel from '../../assets/icons/wheel_2.svg'

type Props = {
  play: boolean
  loaded: any
}

export default function JogWheel({ play, loaded }: Props) {
  return (
    <div className="jogwheel__container">
      <div className="jogwheel__wheel-ring"
        style={{
          border: loaded ? '3px solid #36546b' : '',
          // backgroundColor: loaded ? '#30363a' : ''
        }}>
        <div className="jogwheel__wheel-wrapper">
          <img
            src={Wheel}
            alt="Wheel"
            className={`jogwheel__wheel${play ? '--playing' : ''}`}
            draggable={false}
            style={{ opacity: loaded ? 1 : .5 }}
          />
        </div>
      </div>
    </div>
  )
}