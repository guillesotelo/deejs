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
import DjsLogo from '../../assets/images/djs-logo-black.png'
import { APP_VERSION } from '../../constants/app'

type Props = {}

export default function Layout({ }: Props) {
    const [leftTrackPath, setLeftTrackPath] = useState('')
    const [leftLoading, setLeftLoading] = useState(true)
    const [leftWavesurfer, setLeftWavesurfer] = useState<WaveSurfer | null>(null)
    const [leftFilters, setLeftFilters] = useState<BiquadFilterNode[] | null>(null)
    const [playLeft, setPlayLeft] = useState(false)
    const [leftTrackName, setLeftTrackName] = useState('')
    const [leftVolume, setLeftVolume] = useState(0.8)
    const [leftPitch, setLeftPitch] = useState(.5)
    const [dbLeft, setDbLeft] = useState(-100)
    const [leftElapsed, setLeftElapsed] = useState('00:00')
    const [leftDuration, setLeftDuration] = useState('00:00')
    const [leftBpn, setLeftBpn] = useState('0.00')
    const leftWaveformRef = useRef<any>()
    const leftWaveSurferRef = useRef<any>({ isPlaying: playLeft })
    const [leftMeta, setLeftMeta] = useState<{ [key: string]: any }>({})
    const [leftMediaNode, setLeftMediaNode] = useState<MediaElementAudioSourceNode | null>(null)
    const [leftAudioContext, setLeftAudioContext] = useState<AudioContext | null>(null)

    const [rightTrackPath, setRightTrackPath] = useState('')
    const [rightLoading, setRightLoading] = useState(true)
    const [rightWavesurfer, setRightWavesurfer] = useState<WaveSurfer | null>(null)
    const [rightFilters, setRightFilters] = useState<BiquadFilterNode[] | null>(null)
    const [playRight, setPlayRight] = useState(false)
    const [rightTrackName, setRightTrackName] = useState('')
    const [rightVolume, setRightVolume] = useState(0.8)
    const [rightPitch, setRightPitch] = useState(.5)
    const [dbRight, setDbRight] = useState(-100)
    const [rightElapsed, setRightElapsed] = useState('00:00')
    const [rightDuration, setRightDuration] = useState('00:00')
    const [rightBpn, setRightBpn] = useState('0.00')
    const rightWaveformRef = useRef<any>()
    const rightWaveSurferRef = useRef<any>({ isPlaying: playLeft })
    const [rightMeta, setRightMeta] = useState<{ [key: string]: any }>({})
    const [rightMediaNode, setRightMediaNode] = useState<MediaElementAudioSourceNode | null>(null)
    const [rightAudioContext, setRightAudioContext] = useState<AudioContext | null>(null)

    const [mixer, setMixer] = useState(.5)
    const [showLayouts, setShowLayouts] = useState(true)
    const [metas, setMetas] = useState(JSON.parse(localStorage.getItem('metas') || '[]'))
    const { isMobile } = useContext(AppContext)

    const [aPressed, setAPressed] = useState(false)
    const [zPressed, setZPressed] = useState(false)
    const [kPressed, setKPressed] = useState(false)

    // console.log('metas', metas)
    // console.log('leftFilters', leftFilters)
    // console.log('rightFilters', rightFilters)

    useEffect(() => {
        if (leftFilters && leftAudioContext) {
            const equalizer = leftFilters.reduce((prev: any, curr) => {
                prev.connect(curr)
                return curr
            }, leftMediaNode)

            equalizer.connect(leftAudioContext.destination)
        }

        if (rightFilters && rightAudioContext) {
            const equalizer = rightFilters.reduce((prev: any, curr) => {
                prev.connect(curr)
                return curr
            }, rightMediaNode)

            equalizer.connect(rightAudioContext.destination)
        }
    }, [leftFilters, rightFilters])

    useEffect(() => {
        if (leftMeta && leftMeta.common) setMetas([...metas, leftMeta.common])
        if (rightMeta && rightMeta.common) setMetas([...metas, rightMeta.common])
    }, [leftMeta, rightMeta])

    useEffect(() => {
        if (leftWavesurfer) getTempo(leftWavesurfer.getDecodedData(), leftWavesurfer.getPlaybackRate(), setLeftBpn)
        if (rightWavesurfer) getTempo(rightWavesurfer.getDecodedData(), rightWavesurfer.getPlaybackRate(), setRightBpn)
    }, [leftPitch, rightPitch])

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
                getTempo(waveSurferInstance.getDecodedData(), waveSurferInstance.getPlaybackRate(), setLeftBpn)
            })

            setLeftWavesurfer(waveSurferInstance)

            return () => waveSurferInstance.destroy()
        }
    }, [leftTrackPath])

    useEffect(() => {
        if (rightWaveformRef && rightWaveformRef.current) {

            const audio = new Audio()
            audio.controls = true
            audio.src = rightTrackPath

            const waveSurferInstance = WaveSurfer.create({
                container: rightWaveformRef.current,
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
            // waveSurferInstance.load(rightTrackPath)
            waveSurferInstance.on('ready', () => {
                setRightLoading(false)
                rightWaveSurferRef.current = waveSurferInstance
                setRightDuration(formatTime(waveSurferInstance.getDuration()))
                getTempo(waveSurferInstance.getDecodedData(), waveSurferInstance.getPlaybackRate(), setRightBpn)
            })

            setRightWavesurfer(waveSurferInstance)

            return () => waveSurferInstance.destroy()
        }
    }, [rightTrackPath])


    useEffect(() => {
        document.onkeydown = handleKeyDown
        document.onkeyup = handleKeyUp
    }, [leftTrackPath, rightTrackPath, playLeft, playRight])

    useEffect(() => {
        let animationFrameId: number
        let prevVolume: number | null = null

        const processAudio = (audioElement: HTMLAudioElement) => {
            const audioContext = new AudioContext()
            const analyser = audioContext.createAnalyser()
            const mediaNode = audioContext.createMediaElementSource(audioElement)
            mediaNode.connect(analyser)
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
                processAudio(audioElement)
            }
        }

        return () => {
            cancelAnimationFrame(animationFrameId)
        }
    }, [leftWavesurfer])

    useEffect(() => {
        let animationFrameId: number
        let prevVolume: number | null = null

        const processAudio = (audioElement: HTMLAudioElement) => {
            const audioContext = new AudioContext()
            const analyser = audioContext.createAnalyser()
            const mediaNode = audioContext.createMediaElementSource(audioElement)
            mediaNode.connect(analyser)
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
                processAudio(audioElement)
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

    const createFilters = (audioContext: AudioContext) => {
        const eqBands = [320, 1000, 3200]

        const filters = eqBands.map((band) => {
            const filter = audioContext.createBiquadFilter()
            const bandType = band <= 320 ? 'lowshelf' : band >= 3200 ? 'highshelf' : 'peaking'
            filter.type = bandType
            filter.gain.value = 0
            filter.frequency.value = band
            return filter
        })
        return filters
    }

    const updateFilters = (side: string, type: string, gainValue: number) => {
        if (side === 'left' && leftFilters) {
            const filteres = leftFilters.map(filter => {
                if (filter.type === type) filter.gain.value = gainValue
                return filter
            })
            setLeftFilters(filteres)

        }
        if (side === 'right' && rightFilters) {
            const filteres = rightFilters.map(filter => {
                if (filter.type === type) filter.gain.value = gainValue
                return filter
            })
            setRightFilters(filteres)
        }
    }

    const getFilter = (side: string, type: string) => {
        if (side === 'left' && leftFilters) {
            const filter = leftFilters.find(filter => filter.type === type)
            if (filter) return filter.gain.value
        }
        if (side === 'right' && rightFilters) {
            const filter = rightFilters.find(filter => filter.type === type)
            if (filter) return filter.gain.value
        }
    }

    const getTempo = async (audioBuffer: AudioBuffer | null, playbackRate: number, setTempo: (value: string) => void) => {
        if (audioBuffer) {
            const tempo = await analyze(audioBuffer)
            if (tempo) setTempo((tempo * playbackRate).toFixed(2))
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
                if (leftTrackPath && !playLeft) {
                    setAPressed(true)
                    playLeftTrack()
                }
                break
            case 'z':
                if (aPressed) setZPressed(true)
                else playLeftTrack()
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
                if (rightTrackPath && !playRight) playRightTrack()
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

    const handleKeyUp = (e: any) => {
        console.log('aPressed', aPressed)
        console.log('zPressed', zPressed)
        switch (e.key.toLowerCase()) {
            case 'a':
                setAPressed(false)
                if (!zPressed && leftTrackPath && playLeft) stopLeftTrack()
                break
            case 'z':
                setZPressed(false)
                break
            case 'm':
                if (rightTrackPath && playRight) stopRightTrack()
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

    const handleleftPitch = (e: any) => {
        const { value } = e.target
        const decimaVal = value / 100
        setLeftPitch(decimaVal)
        leftWavesurfer?.setPlaybackRate(1 + ((decimaVal - 0.5) / 3))
    }

    const handlerightPitch = (e: any) => {
        const { value } = e.target
        const decimaVal = value / 100
        setRightPitch(decimaVal)
        rightWavesurfer?.setPlaybackRate(1 + ((decimaVal - 0.5) / 3))
    }

    const getTrackMeta = (tag: string, deck: string) => {
        if (deck === 'left' && leftMeta.common) {
            return String(leftMeta.common[tag])
        }
        if (deck === 'right' && rightMeta.common) {
            return String(rightMeta.common[tag])
        }
    }

    const onResetLeftPitch = () => {
        setLeftPitch(.5)
        leftWavesurfer?.setPlaybackRate(1)
    }

    const onResetRightPitch = () => {
        setRightPitch(.5)
        rightWavesurfer?.setPlaybackRate(1)
    }

    const onResetMixer = () => {
        setMixer(.5)
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
                            <div className="waveform__info" style={{ width: '55%' }}>
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
                            borderColor='#544322'
                        />
                        <Button
                            label={playLeft ? 'Pause' : 'Play'}
                            handleClick={playLeftTrack}
                            textColor='#25bc2d'
                            svg={PlayPause}
                            playing={Boolean(leftTrackPath && playLeft)}
                            pause={Boolean(leftTrackPath && !playLeft)}
                            disabled={Boolean(leftTrackPath && leftLoading)}
                            borderColor='#134c13'
                        />
                    </div>
                    <div className="layout__player-pitch">
                        <Slider
                            value={leftPitch}
                            handleChange={handleleftPitch}
                            orientation='v'
                            // scale={1.2}
                            label={leftPitch}
                            onReset={onResetLeftPitch}
                            reset={leftPitch === 0.5}
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

                <div className="layout__logo">
                    <img src={DjsLogo} alt="DJS" className="layout__logo-image" draggable={false} />
                    <div className="layout__logo-col">
                        <p className="layout__logo-text">Online sessions</p>
                        <p className="layout__logo-text">{APP_VERSION}</p>
                    </div>
                </div>
                <div className="layout__center-row">
                    <div className="layout__center-left">
                        <div className="layout__knobs">
                            <Knob
                                label='HI'
                                value={getFilter('left', 'highshelf')}
                                setValue={value => updateFilters('left', 'highshelf', value)}
                                onReset={() => updateFilters('left', 'highshelf', 0)}
                                reset={getFilter('left', 'highshelf') === 0}
                            />
                            <Knob
                                label='MID'
                                value={getFilter('left', 'peaking')}
                                setValue={value => updateFilters('left', 'peaking', value)}
                                onReset={() => updateFilters('left', 'peaking', 0)}
                                reset={getFilter('left', 'peaking') === 0}
                            />
                            <Knob
                                label='LOW'
                                value={getFilter('left', 'lowshelf')}
                                setValue={value => updateFilters('left', 'lowshelf', value)}
                                onReset={() => updateFilters('left', 'lowshelf', 0)}
                                reset={getFilter('left', 'lowshelf') === 0}
                            />
                        </div>
                        <Slider
                            value={leftVolume}
                            handleChange={handleLeftVolumeChange}
                            orientation='v'
                            showLevel
                        />
                    </div>
                    <div className="layout__center-center">
                        <VolumeBar level={dbLeft} />
                        <VolumeBar level={dbRight} />
                    </div>
                    <div className="layout__center-right">
                        <div className="layout__knobs">
                            <Knob
                                label='HI'
                                value={getFilter('right', 'highshelf')}
                                setValue={value => updateFilters('right', 'highshelf', value)}
                                onReset={() => updateFilters('right', 'highshelf', 0)}
                                reset={getFilter('right', 'highshelf') === 0}
                            />
                            <Knob
                                label='MID'
                                value={getFilter('right', 'peaking')}
                                setValue={value => updateFilters('right', 'peaking', value)}
                                onReset={() => updateFilters('right', 'peaking', 0)}
                                reset={getFilter('right', 'peaking') === 0}
                            />
                            <Knob
                                label='LOW'
                                value={getFilter('right', 'lowshelf')}
                                setValue={value => updateFilters('right', 'lowshelf', value)}
                                onReset={() => updateFilters('right', 'lowshelf', 0)}
                                reset={getFilter('right', 'lowshelf') === 0}
                            />
                        </div>
                        <Slider
                            value={rightVolume}
                            handleChange={handleRightVolumeChange}
                            orientation='v'
                            showLevel
                        />
                    </div>
                </div>
                <div className="layout__center-mix">
                    <Slider
                        value={mixer}
                        handleChange={handleMixer}
                        onReset={onResetMixer}
                        reset={mixer === 0.5}
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
                            <div className="waveform__info" style={{ width: '50%' }}>
                                <p className="waveform__track-number">2</p>
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
                            borderColor='#544322'
                        />
                        <Button
                            label={playRight ? 'Pause' : 'Play'}
                            handleClick={playRightTrack}
                            textColor='#25bc2d'
                            svg={PlayPause}
                            playing={Boolean(rightTrackPath && playRight)}
                            pause={Boolean(rightTrackPath && !playRight)}
                            disabled={Boolean(rightTrackPath && rightLoading)}
                            borderColor='#134c13'
                        />
                    </div>
                    <div className="layout__player-pitch">
                        <Slider
                            value={rightPitch}
                            handleChange={handlerightPitch}
                            orientation='v'
                            // scale={0.7}
                            onReset={onResetRightPitch}
                            reset={rightPitch === 0.5}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}