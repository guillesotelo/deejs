import React, { useContext, useEffect, useRef, useState } from 'react'
import JogWheel from '../JogWheel/JogWheel'
import Button from '../Button/Button'
import FileInput from '../FileInput/FileInput'
import Slider from '../Slider/Slider'
import PlayPause from '../../assets/icons/play-pause.svg'
import Knob from '../Knob/Knob'
import VolumeBar from '../VolumeBar/VolumeBar'
import Switch from '../Switch/Switch'
import WaveSurfer from 'wavesurfer.js'
import { AppContext } from '../../AppContext'
import * as musicMetadata from 'music-metadata-browser';

type Props = {}

export default function Layout({ }: Props) {
    const [leftTrackPath, setLeftTrackPath] = useState('')
    const [rightTrackPath, setRightTrackPath] = useState('')
    const [leftLoading, setLeftLoading] = useState(true)
    const [rightLoading, setRightLoading] = useState(true)
    const [leftWavesurfer, setLeftWavesurfer] = useState<WaveSurfer | null>(null)
    const [rightWavesurfer, setRightWavesurfer] = useState<WaveSurfer | null>(null)

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
    const [dbRight, setDbRight] = useState(-100)

    const [showLayouts, setShowLayouts] = useState(false)

    const leftWaveformRef = useRef<any>()
    const leftWaveSurferRef = useRef<any>({ isPlaying: playLeft })
    const rightWaveformRef = useRef<any>()
    const rightWaveSurferRef = useRef<any>({ isPlaying: playLeft })

    const [leftMetadata, setLeftMetadata] = useState()

    const { isMobile } = useContext(AppContext)

    useEffect(() => {
        if (leftWaveformRef && leftWaveformRef.current) {
            const waveSurferInstance = WaveSurfer.create({
                container: leftWaveformRef.current,
                height: 70,
                minPxPerSec: 50,
            })
            waveSurferInstance.load(leftTrackPath)
            waveSurferInstance.on('ready', () => {
                setLeftLoading(false)
                leftWaveSurferRef.current = waveSurferInstance
            })

            console.log(getMetadata(leftTrackPath))

            setLeftWavesurfer(waveSurferInstance)

            return () => {
                waveSurferInstance.destroy()
            }
        }
    }, [leftTrackPath])

    useEffect(() => {
        if (rightWaveformRef && rightWaveformRef.current) {
            const waveSurferInstance = WaveSurfer.create({
                container: rightWaveformRef.current,
                height: 70,
                minPxPerSec: 50,
                autoCenter: true
            })
            waveSurferInstance.load(rightTrackPath)
            waveSurferInstance.on('ready', () => {
                setRightLoading(false)
                rightWaveSurferRef.current = waveSurferInstance
            })

            setRightWavesurfer(waveSurferInstance)

            return () => {
                waveSurferInstance.destroy()
            }
        }
    }, [rightTrackPath])


    useEffect(() => {
        document.onkeydown = handleKeyDown
    }, [leftTrackPath, rightTrackPath, playLeft, playRight])

    useEffect(() => {
        let animationFrameId: number
        let prevVolume: number | null = null

        const calculateVolumeInDecibels = (audioElement: HTMLAudioElement) => {
            const audioContext = new AudioContext()
            const analyser = audioContext.createAnalyser()
            const source = audioContext.createMediaElementSource(audioElement)
            source.connect(analyser)
            analyser.connect(audioContext.destination)

            analyser.fftSize = 256
            analyser.smoothingTimeConstant = 0.8

            const bufferLength = analyser.frequencyBinCount
            const dataArray = new Uint8Array(bufferLength)

            const getVolumeInDecibels = () => {
                analyser.getByteFrequencyData(dataArray)
                const sum = dataArray.reduce((acc, value) => acc + value, 0)
                const average = sum / bufferLength
                const volumeInDecibels = 20 * Math.log10(average / 255)

                // Only update state if there's a significant change in volume
                if (prevVolume === null || Math.abs(volumeInDecibels - prevVolume) >= 1) {
                    setDbLeft(volumeInDecibels)
                    prevVolume = volumeInDecibels
                }
                animationFrameId = requestAnimationFrame(getVolumeInDecibels)
            }
            getVolumeInDecibels()
        }

        if (leftWavesurfer) {
            const audioElement = leftWavesurfer.getMediaElement()
            if (audioElement) {
                calculateVolumeInDecibels(audioElement)
            }
        }

        return () => {
            cancelAnimationFrame(animationFrameId)
        }
    }, [leftWavesurfer])

    useEffect(() => {
        let animationFrameId: number
        let prevVolume: number | null = null

        const calculateVolumeInDecibels = (audioElement: HTMLAudioElement) => {
            const audioContext = new AudioContext()
            const analyser = audioContext.createAnalyser()
            const source = audioContext.createMediaElementSource(audioElement)
            source.connect(analyser)
            analyser.connect(audioContext.destination)

            analyser.fftSize = 256
            analyser.smoothingTimeConstant = 0.8

            const bufferLength = analyser.frequencyBinCount
            const dataArray = new Uint8Array(bufferLength)

            const getVolumeInDecibels = () => {
                analyser.getByteFrequencyData(dataArray)
                const sum = dataArray.reduce((acc, value) => acc + value, 0)
                const average = sum / bufferLength
                const volumeInDecibels = 20 * Math.log10(average / 255)

                // Only update state if there's a significant change in volume
                if (prevVolume === null || Math.abs(volumeInDecibels - prevVolume) >= 1) {
                    setDbRight(volumeInDecibels)
                    prevVolume = volumeInDecibels
                }
                animationFrameId = requestAnimationFrame(getVolumeInDecibels)
            }
            getVolumeInDecibels()
        }

        if (rightWavesurfer) {
            const audioElement = rightWavesurfer.getMediaElement()
            if (audioElement) {
                calculateVolumeInDecibels(audioElement)
            }
        }

        return () => {
            cancelAnimationFrame(animationFrameId)
        }
    }, [rightWavesurfer])

    useEffect(() => {
        const leftMix = leftVolume + (mixer > 0.5 ? -(leftVolume * (mixer - 0.5) * 2) : 0)
        const rightMix = rightVolume + (mixer < 0.5 ? (rightVolume * (mixer - 0.5) * 2) : 0)
        leftWavesurfer?.setVolume(leftMix)
        rightWavesurfer?.setVolume(rightMix)
    }, [leftVolume, rightVolume, mixer])

    const getMetadata = async (audioTrackUrl: string) => {
        try {
            const metadata = await musicMetadata.fetchFromUrl(audioTrackUrl)
            return metadata || {}
        } catch (error) {
            console.error(error)
        }
    }

    const loadTrack = (side: string, track: string) => {
        if (track) {
            if (side === 'left') {
                stopLeftTrack()
                setLeftTrackPath(track)
            }
            if (side === 'right') {
                stopRightTrack()
                setRightTrackPath(track)
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
        if (leftWaveSurferRef.current && leftWaveSurferRef.current.pause) {
            if (leftWaveSurferRef.current.isPlaying()) leftWaveSurferRef.current.pause()
            else leftWaveSurferRef.current.play()
            setPlayLeft(leftWaveSurferRef.current.isPlaying())
        } else openFileLoaderLeft()
    }

    const playRightTrack = () => {
        if (rightWaveSurferRef.current && rightWaveSurferRef.current.play) {
            if (rightWaveSurferRef.current.isPlaying()) rightWaveSurferRef.current.pause()
            else rightWaveSurferRef.current.play()
            setPlayRight(rightWaveSurferRef.current.isPlaying())
        } else openFileLoaderRight()
    }

    const stopLeftTrack = () => {
        if (leftWaveSurferRef.current && leftWaveSurferRef.current.stop) {
            leftWaveSurferRef.current.stop()
            setPlayLeft(leftWaveSurferRef.current.isPlaying())
        }
    }

    const stopRightTrack = () => {
        if (rightWaveSurferRef.current && rightWaveSurferRef.current.stop) {
            rightWaveSurferRef.current.stop()
            setPlayRight(rightWaveSurferRef.current.isPlaying())
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
        leftWavesurfer?.setPlaybackRate(1 + ((decimaVal - 0.5) / 5))
    }

    const handlePitchRight = (e: any) => {
        const { value } = e.target
        const decimaVal = value / 100
        setPitchRight(decimaVal)
        rightWavesurfer?.setPlaybackRate(1 + ((decimaVal - 0.5) / 5))
    }

    const handleEq = (channel: string, type: string, value: number) => {
        //     const audioContext = channel === 'left' ? leftAudioContext : rightAudioContext
        //     const trackAudio = channel === 'left' ? leftTrackAudio : rightTrackAudio

        //     if (trackAudio) {
        //         // Get the existing filter node if it already exists, otherwise create a new one
        //         const filterNode = channel === 'left' ? leftFilterNode : rightFilterNode
        //         const filter = filterNode ? filterNode[type] : audioContext.createBiquadFilter()

        //         // Update filter parameters
        //         filter.type = type as BiquadFilterType
        //         filter.frequency.value = 1000 // Adjust as needed
        //         filter.gain.value = (value - 50) / 10 // Adjust gain based on slider value
        //         filter.Q.value = 1 // Adjust Q factor as needed

        //         // Connect the audio source to the filter, and then to the destination
        //         const source = audioContext.createMediaElementSource(trackAudio)
        //         source.connect(filter)
        //         filter.connect(audioContext.destination)

        //         // Store the filter node for future reference
        //         if (channel === 'left') {
        //             setLeftFilterNode({ ...leftFilterNode, [type]: filter })
        //         } else {
        //             setRightFilterNode({ ...rightFilterNode, [type]: filter })
        //         }

        //         // Apply the changes to the playing track
        //         applyFilterChanges(channel, type, value)
        //     }
    }

    // const applyFilterChanges = (channel: string, type: string, value: number) => {
    //     const audioContext = channel === 'left' ? leftAudioContext : rightAudioContext
    //     const filterNode = channel === 'left' ? leftFilterNode : rightFilterNode

    //     if (filterNode[type]) {
    //         let source
    //         if (channel === 'left' && leftTrackAudio) source = audioContext.createMediaElementSource(leftTrackAudio)
    //         else if (channel === 'right' && rightTrackAudio) source = audioContext.createMediaElementSource(rightTrackAudio)
    //         if (source) {
    //             // Disconnect the previous filter node from the destination
    //             filterNode[type].disconnect()
    //             // Connect the audio source to the updated filter node, and then to the destination
    //             source.connect(filterNode[type])
    //             filterNode[type].connect(audioContext.destination)
    //         }
    //     }
    // }

    return (
        <div className="layout__container" tabIndex={0} style={{ outline: 'none', transform: isMobile ? 'rotate(90deg)' : '' }}>
            <Switch
                label='Show Layouts'
                on='YES'
                off='NO'
                value={showLayouts}
                setValue={setShowLayouts}
                style={{ position: 'absolute', top: '1rem', right: 'calc(50%-3rem)', zIndex: 5 }}
            />
            <div className="layout__left">

                <div className="waveform__wrapper">
                    {leftTrackPath && leftLoading ?
                        <div className="waveform__placeholder">
                            <p className="waveform__loading">Loading waveform...</p>
                        </div>
                        :
                        <div className='waveform__row'>
                            <div className="waveform__info">
                                <p className="waveform__track-number">1</p>
                                <div className="waveform__track-name">
                                    <p className="waveform__track-title">{leftTrackName || 'No track loaded'}</p>
                                    <p className="waveform__track-subtitle">Subtitle</p>
                                </div>
                            </div>
                        </div>
                    }
                    <div ref={leftWaveformRef} className='waveform__container' style={{ display: leftTrackPath && leftLoading ? 'none' : '' }} />
                </div>

                <FileInput
                    setFile={file => loadTrack('left', file)}
                    setFileName={setLeftTrackName}
                    showLayouts={showLayouts}
                    inputId='left-track-input'>
                    {showLayouts ?
                        <JogWheel
                            play={playLeft}
                            loaded={leftTrackName} />
                        : ''}
                </FileInput>
                <div className="layout__player">
                    <div className="layout__player-btns">
                        <Button
                            label='CUE'
                            handleClick={stopLeftTrack}
                            textColor='orange'
                            disabled={Boolean(leftTrackPath && leftLoading)}
                        />
                        <Button
                            label={playLeft ? 'Pause' : 'Play'}
                            handleClick={playLeftTrack}
                            textColor='#25bc2d'
                            svg={PlayPause}
                            animate={playLeft}
                            disabled={Boolean(leftTrackPath && leftLoading)}
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
                        <VolumeBar level={dbRight} />
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

                <div className="waveform__wrapper">
                    {rightTrackPath && rightLoading ?
                        <div className="waveform__placeholder">
                            <p className="waveform__loading">Loading waveform...</p>
                        </div>
                        : ''}
                    <div ref={rightWaveformRef} className='waveform__container' />
                </div>

                <FileInput
                    setFile={file => loadTrack('right', file)}
                    setFileName={setRightTrackName}
                    showLayouts={showLayouts}
                    inputId='right-track-input'>
                    {showLayouts ?
                        <JogWheel
                            play={playRight}
                            loaded={rightTrackName} />
                        : ''}
                </FileInput>
                <div className="layout__player">
                    <div className="layout__player-btns">
                        <Button
                            label='CUE'
                            handleClick={stopRightTrack}
                            textColor='orange'
                            disabled={Boolean(rightTrackPath && rightLoading)}
                        />
                        <Button
                            label={playRight ? 'Pause' : 'Play'}
                            handleClick={playRightTrack}
                            textColor='#25bc2d'
                            svg={PlayPause}
                            animate={playRight}
                            disabled={Boolean(rightTrackPath && rightLoading)}
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