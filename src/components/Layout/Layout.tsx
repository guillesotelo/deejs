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
import Minimap from 'wavesurfer.js/dist/plugins/minimap.esm.js'
import { AppContext } from '../../AppContext'
import { formatTime } from '../../helpers'
import { analyze } from 'web-audio-beat-detector'

type Props = {}

export default function Layout({ }: Props) {
    const [leftTrackPath, setLeftTrackPath] = useState('')
    const [leftLoading, setLeftLoading] = useState(true)
    const [leftWavesurfer, setLeftWavesurfer] = useState<WaveSurfer | null>(null)
    const [playLeft, setPlayLeft] = useState(false)
    const [leftTrackName, setLeftTrackName] = useState('')
    const [leftVolume, setLeftVolume] = useState(0.8)
    const [pitchLeft, setPitchLeft] = useState(.5)
    const [dbLeft, setDbLeft] = useState(-100)
    const [leftElapsed, setLeftElapsed] = useState('00:00')
    const [leftDuration, setLeftDuration] = useState('00:00')
    const [leftBpn, setLeftBpn] = useState('0.00')
    const leftWaveformRef = useRef<any>()
    const leftWaveSurferRef = useRef<any>({ isPlaying: playLeft })
    const [leftMeta, setLeftMeta] = useState<{ [key: string]: any }>({})

    const [rightTrackPath, setRightTrackPath] = useState('')
    const [rightLoading, setRightLoading] = useState(true)
    const [rightWavesurfer, setRightWavesurfer] = useState<WaveSurfer | null>(null)
    const [playRight, setPlayRight] = useState(false)
    const [rightTrackName, setRightTrackName] = useState('')
    const [rightVolume, setRightVolume] = useState(0.8)
    const [pitchRight, setPitchRight] = useState(.5)
    const [dbRight, setDbRight] = useState(-100)
    const [rightElapsed, setRightElapsed] = useState('00:00')
    const [rightDuration, setRightDuration] = useState('00:00')
    const [rightBpn, setRightBpn] = useState('0.00')
    const rightWaveformRef = useRef<any>()
    const rightWaveSurferRef = useRef<any>({ isPlaying: playLeft })
    const [rightMeta, setRightMeta] = useState<{ [key: string]: any }>({})

    const [mixer, setMixer] = useState(.5)
    const [showLayouts, setShowLayouts] = useState(true)
    const [metas, setMetas] = useState(JSON.parse(localStorage.getItem('metas') || '[]'))
    const { isMobile } = useContext(AppContext)

    const [leftFilterNodes, setLeftFilterNodes] = useState({});
    const [rightFilterNodes, setRightFilterNodes] = useState({});

    // console.log('metas', metas)

    useEffect(() => {
        if (leftMeta && leftMeta.common) setMetas([...metas, leftMeta.common])
        if (rightMeta && rightMeta.common) setMetas([...metas, rightMeta.common])
    }, [leftMeta, rightMeta])

    useEffect(() => {
        if (leftElapsed >= leftDuration) stopLeftTrack()
        if (rightElapsed >= rightDuration) stopRightTrack()
    }, [leftElapsed, rightElapsed])

    useEffect(() => {
        if (leftWaveformRef && leftWaveformRef.current) {

            const audio = new Audio()
            audio.controls = true
            audio.src = leftTrackPath

            const waveSurferInstance = WaveSurfer.create({
                container: leftWaveformRef.current,
                height: 70,
                minPxPerSec: 50,
                normalize: true,
                waveColor: '#666666',
                progressColor: '#689cad',
                hideScrollbar: true,
                dragToSeek: true,
                media: audio,
                plugins: [
                    Minimap.create({
                        height: 20,
                        waveColor: '#353535',
                        progressColor: '#576b72',
                    }),
                ],
            })
            // waveSurferInstance.load(leftTrackPath)
            waveSurferInstance.on('ready', () => {
                setLeftLoading(false)
                leftWaveSurferRef.current = waveSurferInstance
                setLeftDuration(formatTime(waveSurferInstance.getDuration()))
                getTempo(waveSurferInstance.getDecodedData(), setLeftBpn)

                // const audioContext = new AudioContext()
                // const mediaNode = audioContext.createMediaElementSource(leftWaveSurferRef.current.getMediaElement())

                // const eqBands = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]

                // // Create a biquad filter for each band
                // const filters = eqBands.map((band) => {
                //     const filter = audioContext.createBiquadFilter()
                //     filter.type = band <= 32 ? 'lowshelf' : band >= 16000 ? 'highshelf' : 'peaking'
                //     filter.gain.value = Math.random() * 40 - 20
                //     filter.Q.value = 1 // resonance
                //     filter.frequency.value = band // the cut-off frequency
                //     return filter
                // })

                // // Connect the filters and media node sequentially
                // const equalizer = filters.reduce((prev: BiquadFilterNode, curr: BiquadFilterNode) => {
                //     prev.connect(curr)
                //     return curr
                // }, mediaNode as any)

                // // Connect the filters to the audio output
                // equalizer.connect(audioContext.destination)
            })

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
                normalize: true,
                waveColor: '#666666',
                progressColor: '#689cad',
                hideScrollbar: true,
                dragToSeek: true,
                plugins: [
                    Minimap.create({
                        height: 20,
                        waveColor: '#8e8e8e',
                        progressColor: '#acbec4',
                    }),
                ],
            })
            waveSurferInstance.load(rightTrackPath)
            waveSurferInstance.on('ready', () => {
                setRightLoading(false)
                rightWaveSurferRef.current = waveSurferInstance
                setRightDuration(formatTime(waveSurferInstance.getDuration()))
                getTempo(waveSurferInstance.getDecodedData(), setRightBpn)
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

                    if (leftWavesurfer) setLeftElapsed(formatTime(leftWavesurfer.getCurrentTime()))
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

                    if (rightWavesurfer) setRightElapsed(formatTime(rightWavesurfer.getCurrentTime()))
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

    const getTempo = async (audioBuffer: AudioBuffer | null, setTempo: (value: string) => void) => {
        if (audioBuffer) {
            const tempo = await analyze(audioBuffer)
            if (tempo) setTempo(tempo.toFixed(2))
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
        // const audioContext = channel === 'left' ? leftAudioContext : rightAudioContext
        // const trackAudio = channel === 'left' ? leftTrackAudio : rightTrackAudio

        // const applyFilterChanges = (channel: string) => {
        //     const audioContext = channel === 'left' ? leftAudioContext : rightAudioContext
        //     const filterNodes = channel === 'left' ? leftFilterNodes : rightFilterNodes
        //     const trackAudio = channel === 'left' ? leftTrackAudio : rightTrackAudio

        //     if (trackAudio) {
        //         // Get the source node
        //         const source = audioContext.createMediaElementSource(trackAudio)

        //         // Disconnect the previous filter nodes from the destination
        //         Object.values(filterNodes).forEach((filter) => {
        //             filter.disconnect()
        //         })

        //         // Connect the source to all filter nodes, and then to the destination
        //         let prevNode = source
        //         Object.values(filterNodes).forEach((filter) => {
        //             prevNode.connect(filter)
        //             prevNode = filter
        //         })
        //         prevNode.connect(audioContext.destination)
        //     }
        // }

        // if (trackAudio) {
        //     // Get the existing filter nodes for the specified channel
        //     const filterNodes = channel === 'left' ? leftFilterNodes : rightFilterNodes

        //     // Get the existing filter node for the specified type, or create a new one if it doesn't exist
        //     let filter = filterNodes[type]
        //     if (!filter) {
        //         filter = audioContext.createBiquadFilter()
        //         filter.type = type as BiquadFilterType
        //         filterNodes[type] = filter

        //         // Update the state to reflect the new filter node
        //         if (channel === 'left') {
        //             setLeftFilterNodes({ ...leftFilterNodes, [type]: filter });
        //         } else {
        //             setRightFilterNodes({ ...rightFilterNodes, [type]: filter });
        //         }
        //     }

        //     // Update filter parameters
        //     filter.frequency.value = 1000 // Adjust as needed
        //     filter.gain.value = (value - 50) / 10 // Adjust gain based on slider value
        //     filter.Q.value = 1 // Adjust Q factor as needed

        //     // Connect the audio source to the filter, and then to the destination
        //     const source = audioContext.createMediaElementSource(trackAudio)
        //     source.connect(filter)
        //     filter.connect(audioContext.destination)

        //     // Apply the changes to the playing track
        //     applyFilterChanges(channel)
        // }
    }


    const getTrackMeta = (tag: string, deck: string) => {
        if (deck === 'left' && leftMeta.common) {
            return String(leftMeta.common[tag])
        }
        if (deck === 'right' && rightMeta.common) {
            return String(rightMeta.common[tag])
        }
    }

    return (
        <div className="layout__container" tabIndex={0} style={{ outline: 'none' }}>
            <div className="layout__left">

                <div className="waveform__wrapper">
                    {leftTrackPath && leftLoading ?
                        <div className="waveform__placeholder">
                            <p className="waveform__loading">Loading waveform...</p>
                        </div>
                        :
                        <div className='waveform__row'>
                            <div className="waveform__info" style={{ width: '65%' }}>
                                <p className="waveform__track-number">1</p>
                                <div className="waveform__track-name">
                                    {leftTrackName ?
                                        <>
                                            <p className="waveform__track-title">{getTrackMeta('title', 'left')}</p>
                                            <p className="waveform__track-artist">{getTrackMeta('artist', 'left')}</p>
                                        </>
                                        :
                                        <p className="waveform__track-title">No track loaded</p>
                                    }
                                </div>
                            </div>
                            <div className="waveform__info">
                                <p className="waveform__track-elapsed">{leftElapsed}</p>
                                <p className="waveform__track-duration">{leftDuration}</p>
                            </div>
                            <div className="waveform__info">
                                <div className="waveform__track-bpn">
                                    <p className="waveform__track-bpn-number">{leftBpn.split('.')[0]}.<span style={{ fontSize: '.9rem' }}>{leftBpn.split('.')[1]}</span></p>
                                    <p className="waveform__track-bpn-label">BPN</p>
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
                    setMeta={setLeftMeta}
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
                            loaded={Boolean(leftTrackPath)}
                        />
                        <Button
                            label={playLeft ? 'Pause' : 'Play'}
                            handleClick={playLeftTrack}
                            textColor='#25bc2d'
                            svg={PlayPause}
                            playing={Boolean(leftTrackPath && playLeft)}
                            pause={Boolean(leftTrackPath && !playLeft)}
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
                <Switch
                    label='Show Layouts'
                    on='YES'
                    off='NO'
                    value={showLayouts}
                    setValue={setShowLayouts}
                    style={{ transform: 'scale(.7)', marginBottom: '-4rem' }}
                />
                <div className="layout__center-screen">
                    <div className="layout__center-screen-table">

                    </div>
                </div>
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
                        :
                        <div className='waveform__row'>
                            <div className="waveform__info" style={{ width: '65%' }}>
                                <p className="waveform__track-number">1</p>
                                <div className="waveform__track-name">
                                    {rightTrackName ?
                                        <>
                                            <p className="waveform__track-title">{getTrackMeta('title', 'right')}</p>
                                            <p className="waveform__track-artist">{getTrackMeta('artist', 'right')}</p>
                                        </>
                                        :
                                        <p className="waveform__track-title">No track loaded</p>
                                    }
                                </div>
                            </div>
                            <div className="waveform__info">
                                <p className="waveform__track-elapsed">{rightElapsed}</p>
                                <p className="waveform__track-duration">{rightDuration}</p>
                            </div>
                            <div className="waveform__info">
                                <div className="waveform__track-bpn">
                                    <p className="waveform__track-bpn-number">{rightBpn.split('.')[0]}.<span style={{ fontSize: '.9rem' }}>{rightBpn.split('.')[1]}</span></p>
                                    <p className="waveform__track-bpn-label">BPN</p>
                                </div>
                            </div>
                        </div>
                    }
                    <div ref={rightWaveformRef} className='waveform__container' style={{ display: rightTrackPath && rightLoading ? 'none' : '' }} />
                </div>

                <FileInput
                    setFile={file => loadTrack('right', file)}
                    setFileName={setRightTrackName}
                    showLayouts={showLayouts}
                    setMeta={setRightMeta}
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
                            loaded={Boolean(rightTrackPath)}
                        />
                        <Button
                            label={playRight ? 'Pause' : 'Play'}
                            handleClick={playRightTrack}
                            textColor='#25bc2d'
                            svg={PlayPause}
                            playing={Boolean(rightTrackPath && playRight)}
                            pause={Boolean(rightTrackPath && !playRight)}
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