import React, { useEffect, useRef, useState } from 'react'
import JogWheel from '../JogWheel/JogWheel'
import Button from '../Button/Button'
import FileInput from '../FileInput/FileInput'
import Slider from '../Slider/Slider'
import PlayPause from '../../assets/icons/play-pause.svg'
import Knob from '../Knob/Knob'
import VolumeBar from '../VolumeBar/VolumeBar'

type Props = {}

export default function Layout({ }: Props) {
    const [playLeft, setPlayLeft] = useState(false)
    const [playRight, setPlayRight] = useState(false)
    const [leftTrack, setLeftTrack] = useState('')
    const [leftTrackAudio, setLeftTrackAudio] = useState<HTMLAudioElement | null>()
    const [rightTrack, setRightTrack] = useState('')
    const [rightTrackAudio, setRightTrackAudio] = useState<HTMLAudioElement | null>()
    const [leftTrackName, setLeftTrackName] = useState('')
    const [rightTrackName, setRightTrackName] = useState('')
    const [leftVolume, setLeftVolume] = useState(0.8)
    const [rightVolume, setRightVolume] = useState(0.8)
    const [mixer, setMixer] = useState(.5)
    const [pitchLeft, setPitchLeft] = useState(.5)
    const [pitchRight, setPitchRight] = useState(.5)
    const [dbLeft, setDbLeft] = useState(0)
    const [dbRught, setDbRight] = useState(0)

    useEffect(() => {
        document.onkeydown = handleKeyDown
    }, [])

    useEffect(() => {
        if (!leftTrackAudio) return

        const audioContextLeft = new (window.AudioContext || (window as any).webkitAudioContext)()
        const analyserLeft = audioContextLeft.createAnalyser()

        const sourceLeft = audioContextLeft.createMediaElementSource(leftTrackAudio)
        sourceLeft.connect(analyserLeft)
        sourceLeft.connect(audioContextLeft.destination)

        analyserLeft.fftSize = 256
        analyserLeft.smoothingTimeConstant = 0.8

        const dataArrayLeft = new Uint8Array(analyserLeft.frequencyBinCount)
        function getVolumeInDecibelsLeft() {
            analyserLeft.getByteFrequencyData(dataArrayLeft)
            const sum = dataArrayLeft.reduce((acc, value) => acc + value, 0)
            const average = sum / dataArrayLeft.length
            const volumeInDecibels = 20 * Math.log10(average / 255)

            setDbLeft(volumeInDecibels)
            requestAnimationFrame(getVolumeInDecibelsLeft)
        }

        getVolumeInDecibelsLeft()
    }, [leftTrackAudio])

    useEffect(() => {
        if (!rightTrackAudio) return

        const audioContextRight = new (window.AudioContext || (window as any).webkitAudioContext)()
        const analyserRight = audioContextRight.createAnalyser()

        const sourceRight = audioContextRight.createMediaElementSource(rightTrackAudio)
        sourceRight.connect(analyserRight)
        sourceRight.connect(audioContextRight.destination)

        analyserRight.fftSize = 256
        analyserRight.smoothingTimeConstant = 0.8

        const dataArrayRight = new Uint8Array(analyserRight.frequencyBinCount)
        function getVolumeInDecibelsRight() {
            analyserRight.getByteFrequencyData(dataArrayRight)
            const sum = dataArrayRight.reduce((acc, value) => acc + value, 0)
            const average = sum / dataArrayRight.length
            const volumeInDecibels = 20 * Math.log10(average / 255)

            setDbRight(volumeInDecibels)
            requestAnimationFrame(getVolumeInDecibelsRight)
        }
        getVolumeInDecibelsRight()
    }, [rightTrackAudio])

    useEffect(() => {
        const leftPlayer = new Audio(leftTrack)
        const rightPlayer = new Audio(rightTrack)

        if (leftTrack) setLeftTrackAudio(leftPlayer)
        if (rightTrack) setRightTrackAudio(rightPlayer)
    }, [leftTrack, rightTrack])

    useEffect(() => {
        const leftPlayer = leftTrackAudio
        const rightPlayer = rightTrackAudio
        const leftMix = leftVolume + (mixer > 0.5 ? -(leftVolume * (mixer - 0.5) * 2) : 0)
        const rightMix = rightVolume + (mixer < 0.5 ? (rightVolume * (mixer - 0.5) * 2) : 0)

        if (leftPlayer) leftPlayer.volume = leftMix
        if (rightPlayer) rightPlayer.volume = rightMix

        if (leftTrack) {
            setLeftTrackAudio(leftPlayer)
            leftPlayer?.addEventListener('ended', () => setPlayLeft(false))
        }
        if (rightTrack) {
            setRightTrackAudio(rightPlayer)
            rightPlayer?.addEventListener('ended', () => setPlayRight(false))
        }
    }, [leftVolume, rightVolume, mixer])

    const handleKeyDown = (e: any) => {
        // console.log('HIT', e.key)
        switch (e.key) {
            case 'q':
                e.preventDefault()
                openFileLoaderLeft()
                break
            case 'a':
                stopLeftTrack()
                break
            case 'z':
                playLeftTrack()
                break
            case 's':
                setLeftVolume((val) => val < 10 ? val + .01 : 10)
                break
            case 'x':
                setLeftVolume((val) => val > .01 ? val - .01 : 0)
                break

            case 'y':
                e.preventDefault()
                openFileLoaderRight()
                break
            case 'j':
                stopRightTrack()
                break
            case 'm':
                playRightTrack()
                break
            case 'h':
                setRightVolume((val) => val < 10 ? val + .01 : 10)
                break
            case 'n':
                setRightVolume((val) => val > .01 ? val - .01 : 0)
                break
            default:
                break
        }
    }

    useEffect(() => {
        stopLeftTrack()
    }, [leftTrack])

    useEffect(() => {
        stopRightTrack()
    }, [rightTrack])

    const openFileLoaderLeft = () => {
        const input = document.getElementById('left-track-input')
        if (input) input.click()
    }

    const openFileLoaderRight = () => {
        const input = document.getElementById('right-track-input')
        if (input) input.click()
    }

    const playLeftTrack = () => {
        if (leftTrackAudio) {
            if (!playLeft) leftTrackAudio.play()
            else leftTrackAudio.pause()
            setPlayLeft(!playLeft)
        }
    }

    const playRightTrack = () => {
        if (rightTrackAudio) {
            if (!playRight) rightTrackAudio.play()
            else rightTrackAudio.pause()
            setPlayRight(!playRight)
        }
    }

    const stopLeftTrack = () => {
        if (leftTrackAudio) {
            leftTrackAudio.pause()
            leftTrackAudio.currentTime = 0
            setPlayLeft(false)
        }
    }

    const stopRightTrack = () => {
        if (rightTrackAudio) {
            rightTrackAudio.pause()
            rightTrackAudio.currentTime = 0
            setPlayRight(false)
        }
    }

    const handleLeftVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value) / 100
        setLeftVolume(newVolume)
    }

    const handleMixer = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMix = parseFloat(e.target.value) / 100
        setMixer(newMix)
    }

    const handleRightVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value) / 100
        setRightVolume(newVolume)
    }

    const handlePitchLeft = (e: any) => {
        setPitchLeft(e.target.value / 100)
    }

    const handlePitchRight = (e: any) => {
        setPitchRight(e.target.value / 100)
    }

    return (
        <div className="layout__container" onKeyDown={handleKeyDown} tabIndex={0} style={{ outline: 'none' }}>
            <div className="layout__left">
                <canvas id='waveform-right'></canvas>
                <h2 className="layout__track-name">{leftTrackName || 'No track loaded'}</h2>
                <FileInput
                    setFile={setLeftTrack}
                    setFileName={setLeftTrackName}
                    inputId='left-track-input'>
                    <JogWheel
                        play={playLeft}
                        loaded={leftTrack} />
                </FileInput>
                <div className="layout__player">
                    <div className="layout__player-btns">
                        <Button
                            label='CUE'
                            handleClick={stopLeftTrack}
                            textColor='orange'
                        />
                        <Button
                            label={playLeft ? 'Pause' : 'Play'}
                            handleClick={playLeftTrack}
                            textColor='#25bc2d'
                            svg={PlayPause}
                            animate={playLeft}
                        />
                    </div>
                    <div className="layout__player-pitch">
                        <Slider
                            value={pitchLeft}
                            handleChange={handlePitchLeft}
                            orientation='v'
                            scale={0.7}
                        />
                    </div>
                </div>
            </div>
            <div className="layout__center">
                <div className="layout__center-row">
                    <div className="layout__center-left">
                        <div className="layout__knobs">
                            <Knob label='HI' />
                            <Knob label='MID' />
                            <Knob label='LOW' />
                        </div>
                        <Slider
                            value={leftVolume}
                            handleChange={handleLeftVolumeChange}
                            orientation='v'
                        />
                    </div>
                    <div className="layout__center-center">
                        <VolumeBar level={dbLeft} />
                        <VolumeBar level={dbRught} />
                    </div>
                    <div className="layout__center-right">
                        <div className="layout__knobs">
                            <Knob label='HI' />
                            <Knob label='MID' />
                            <Knob label='LOW' />
                        </div>
                        <Slider
                            value={rightVolume}
                            handleChange={handleRightVolumeChange}
                            orientation='v'
                        />
                    </div>
                </div>
                <div className="layout__center-mix">
                    <Slider
                        value={mixer}
                        handleChange={handleMixer}
                    />
                </div>
            </div>
            <div className="layout__right">
                <canvas id='waveform-left'></canvas>
                <h2 className="layout__track-name">{rightTrackName || 'No track loaded'}</h2>
                <FileInput
                    setFile={setRightTrack}
                    setFileName={setRightTrackName}
                    inputId='right-track-input'>
                    <JogWheel
                        play={playRight}
                        loaded={rightTrack} />
                </FileInput>
                <div className="layout__player">
                    <div className="layout__player-btns">
                        <Button
                            label='CUE'
                            handleClick={stopRightTrack}
                            textColor='orange'
                        />
                        <Button
                            label={playRight ? 'Pause' : 'Play'}
                            handleClick={playRightTrack}
                            textColor='#25bc2d'
                            svg={PlayPause}
                            animate={playRight}
                        />
                    </div>
                    <div className="layout__player-pitch">
                        <Slider
                            value={pitchRight}
                            handleChange={handlePitchRight}
                            orientation='v'
                            scale={0.7}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}