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
    const [leftTrackAudio, setLeftTrackAudio] = useState<HTMLAudioElement | null>()
    const [rightTrackAudio, setRightTrackAudio] = useState<HTMLAudioElement | null>()
    const [playLeft, setPlayLeft] = useState(false)
    const [playRight, setPlayRight] = useState(false)
    const [leftTrackName, setLeftTrackName] = useState('')
    const [rightTrackName, setRightTrackName] = useState('')
    const [leftVolume, setLeftVolume] = useState(0.8)
    const [rightVolume, setRightVolume] = useState(0.8)
    const [mixer, setMixer] = useState(.5)
    const [pitchLeft, setPitchLeft] = useState(.5)
    const [pitchRight, setPitchRight] = useState(.5)
    const [dbLeft, setDbLeft] = useState(-100)
    const [dbRught, setDbRight] = useState(-100)
    const [leftFilterNode, setLeftFilterNode] = useState<{ [key: string]: BiquadFilterNode }>({})
    const [rightFilterNode, setRightFilterNode] = useState<{ [key: string]: BiquadFilterNode }>({})

    const leftAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const rightAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    useEffect(() => {
        document.onkeydown = handleKeyDown
    }, [leftTrackAudio, playLeft, rightTrackAudio, playRight])

    useEffect(() => {
        if (!leftTrackAudio) return

        const analyserLeft = leftAudioContext.createAnalyser()

        const sourceLeft = leftAudioContext.createMediaElementSource(leftTrackAudio)
        sourceLeft.connect(analyserLeft)
        sourceLeft.connect(leftAudioContext.destination)

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

        const analyserRight = rightAudioContext.createAnalyser()

        const sourceRight = rightAudioContext.createMediaElementSource(rightTrackAudio)
        sourceRight.connect(analyserRight)
        sourceRight.connect(rightAudioContext.destination)

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
        const leftPlayer = leftTrackAudio
        const rightPlayer = rightTrackAudio
        const leftMix = leftVolume + (mixer > 0.5 ? -(leftVolume * (mixer - 0.5) * 2) : 0)
        const rightMix = rightVolume + (mixer < 0.5 ? (rightVolume * (mixer - 0.5) * 2) : 0)

        if (leftPlayer) leftPlayer.volume = leftMix
        if (rightPlayer) rightPlayer.volume = rightMix

        if (leftTrackName) {
            setLeftTrackAudio(leftPlayer)
            leftPlayer?.addEventListener('ended', () => setPlayLeft(false))
        }
        if (rightTrackName) {
            setRightTrackAudio(rightPlayer)
            rightPlayer?.addEventListener('ended', () => setPlayRight(false))
        }
    }, [leftVolume, rightVolume, mixer])

    const loadTrack = (side: string, track: string) => {
        if (track) {
            const player = new Audio(track)
            if (side === 'left') {
                stopLeftTrack()
                setLeftTrackAudio(player)
            }
            if (side === 'right') {
                stopRightTrack()
                setRightTrackAudio(player)
            }
        }
    }

    const handleKeyDown = (e: any) => {
        // console.log('HIT', e.key)
        switch (e.key.toLowerCase()) {
            case 'q':
                openFileLoaderLeft()
                break
            case 'a':
                stopLeftTrack()
                break
            case 'z':
                playLeftTrack()
                break
            case 's':
                setLeftVolume((val) => val + .02 < 1 ? val + .02 : 1)
                break
            case 'x':
                setLeftVolume((val) => val > .02 ? val - .02 : 0)
                break

            case 'f':
                setMixer((val) => val > .02 ? val - .02 : 0)
                break
            case 'g':
                setMixer((val) => val + .02 < 1 ? val + .02 : 1)
                break
            case 'y':
                openFileLoaderRight()
                break
            case 'k':
                stopRightTrack()
                break
            case 'm':
                playRightTrack()
                break
            case 'j':
                setRightVolume((val) => val + .02 < 1 ? val + .02 : 1)
                break
            case 'n':
                setRightVolume((val) => val > .02 ? val - .02 : 0)
                break
            default:
                break
        }
    }

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
        const { value } = e.target
        const decimaVal = value / 100
        setPitchLeft(decimaVal)
        if (leftTrackAudio) {
            const newValue = 1 + ((decimaVal - 0.5) / 5)
            const newPitch = leftTrackAudio
            newPitch.playbackRate = newValue
            setLeftTrackAudio(newPitch)
        }
    }

    const handlePitchRight = (e: any) => {
        const { value } = e.target
        const decimaVal = value / 100
        setPitchRight(decimaVal)
        if (rightTrackAudio) {
            const newValue = 1 + ((decimaVal - 0.5) / 5)
            const newPitch = rightTrackAudio
            newPitch.playbackRate = newValue
            setRightTrackAudio(newPitch)
        }
    }

    const handleEq = (channel: string, type: string, value: number) => {
        const audioContext = channel === 'left' ? leftAudioContext : rightAudioContext
        const trackAudio = channel === 'left' ? leftTrackAudio : rightTrackAudio

        if (trackAudio) {
            // Get the existing filter node if it already exists, otherwise create a new one
            const filterNode = channel === 'left' ? leftFilterNode : rightFilterNode
            const filter = filterNode ? filterNode[type] : audioContext.createBiquadFilter()

            // Update filter parameters
            filter.type = type as BiquadFilterType
            filter.frequency.value = 1000 // Adjust as needed
            filter.gain.value = (value - 50) / 10 // Adjust gain based on slider value
            filter.Q.value = 1 // Adjust Q factor as needed

            // Connect the audio source to the filter, and then to the destination
            const source = audioContext.createMediaElementSource(trackAudio)
            source.connect(filter)
            filter.connect(audioContext.destination)

            // Store the filter node for future reference
            if (channel === 'left') {
                setLeftFilterNode({ ...leftFilterNode, [type]: filter })
            } else {
                setRightFilterNode({ ...rightFilterNode, [type]: filter })
            }

            // Apply the changes to the playing track
            applyFilterChanges(channel, type, value)
        }
    }

    const applyFilterChanges = (channel: string, type: string, value: number) => {
        const audioContext = channel === 'left' ? leftAudioContext : rightAudioContext
        const filterNode = channel === 'left' ? leftFilterNode : rightFilterNode

        if (filterNode[type]) {
            let source
            if (channel === 'left' && leftTrackAudio) source = audioContext.createMediaElementSource(leftTrackAudio)
            else if (channel === 'right' && rightTrackAudio) source = audioContext.createMediaElementSource(rightTrackAudio)
            if (source) {
                // Disconnect the previous filter node from the destination
                filterNode[type].disconnect()
                // Connect the audio source to the updated filter node, and then to the destination
                source.connect(filterNode[type])
                filterNode[type].connect(audioContext.destination)
            }
        }
    }

    return (
        <div className="layout__container" tabIndex={0} style={{ outline: 'none' }}>
            <div className="layout__left">
                <canvas id='waveform-right'></canvas>
                <h2 className="layout__track-name">{leftTrackName || 'No track loaded'}</h2>
                <FileInput
                    setFile={file => loadTrack('left', file)}
                    setFileName={setLeftTrackName}
                    inputId='left-track-input'>
                    <JogWheel
                        play={playLeft}
                        loaded={leftTrackName} />
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
                            label={pitchLeft}
                        />
                    </div>
                </div>
            </div>
            <div className="layout__center">
                <div className="layout__center-row">
                    <div className="layout__center-left">
                        <div className="layout__knobs">
                            <Knob label='HI' setValue={(value) => handleEq('left', 'highshelf', value)} />
                            <Knob label='MID' setValue={(value) => handleEq('left', 'peaking', value)} />
                            <Knob label='LOW' setValue={(value) => handleEq('left', 'lowshelf', value)} />
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
                            <Knob label='HI' setValue={(value) => handleEq('right', 'highshelf', value)} />
                            <Knob label='MID' setValue={(value) => handleEq('right', 'peaking', value)} />
                            <Knob label='LOW' setValue={(value) => handleEq('right', 'lowshelf', value)} />
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
                    setFile={file => loadTrack('right', file)}
                    setFileName={setRightTrackName}
                    inputId='right-track-input'>
                    <JogWheel
                        play={playRight}
                        loaded={rightTrackName} />
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