import React, { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'

type Props = {
    audioUrl: string
    style?: React.CSSProperties
    isPlaying?: boolean
    setIsPlaying?: (value: boolean) => void
    volume?: number
    setVolume?: (value: number) => void
    pitch?: number
    setPitch?: (value: number) => void
    play?: () => void // Function to play the audio
    pause?: () => void // Function to pause the audio
    stop?: () => void // Function to stop the audio
}
const Waveform = ({
    audioUrl,
    style,
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    pitch,
    setPitch,
    play,
    pause,
    stop,
}: Props) => {
    const [loading, setLoading] = useState(true)
    const [wavesurfer, setWaveSurfer] = useState<WaveSurfer | null>(null)
    const containerRef = useRef<any>()
    const waveSurferRef = useRef<any>({
        isPlaying
    })

    useEffect(() => {
        if (containerRef && containerRef.current) {
            const waveSurferInstance = WaveSurfer.create({
                container: containerRef.current,
                height: 50,
            })
            waveSurferInstance.load(audioUrl)
            waveSurferInstance.on('ready', () => {
                setLoading(false)
                waveSurferRef.current = waveSurferInstance
            })

            setWaveSurfer(waveSurferInstance)

            return () => {
                waveSurferInstance.destroy()
            }
        }
    }, [audioUrl])

    useEffect(() => {
        if (volume !== undefined && wavesurfer) {
            wavesurfer.setVolume(volume)
        }
    }, [volume, wavesurfer])

    useEffect(() => {
        if (pitch !== undefined && wavesurfer) {
            wavesurfer.setPlaybackRate(pitch)
        }
    }, [pitch, wavesurfer])

    const playAudio = () => {
        if (waveSurferRef.current && waveSurferRef.current.play) {
            waveSurferRef.current.play()
            if (setIsPlaying) setIsPlaying(waveSurferRef.current.isPlaying())
        }
    }

    const pauseAudio = () => {
        if (waveSurferRef.current && waveSurferRef.current.pause) {
            waveSurferRef.current.pause()
            if (setIsPlaying) setIsPlaying(waveSurferRef.current.isPlaying())
        }
    }

    const stopAudio = () => {
        if (waveSurferRef.current && waveSurferRef.current.stop) {
            waveSurferRef.current.stop()
            if (setIsPlaying) setIsPlaying(waveSurferRef.current.isPlaying())
        }
    }

    useEffect(() => {
        if (play) playAudio()
    }, [play])

    useEffect(() => {
        if (pause) pauseAudio()
    }, [pause])

    useEffect(() => {
        if (stop) stopAudio()
    }, [stop])

    return <div className="waveform__wrapper">
        <p className="waveform__loading">Loading...</p> 
        <div ref={containerRef} style={style} className='waveform__container' />
        <button
            onClick={() => {
                waveSurferRef.current.playPause()
                if (setIsPlaying) setIsPlaying(waveSurferRef.current.isPlaying())
            }}
            type="button"
        >
            {isPlaying ? 'pause' : 'play'}
        </button>
    </div>
}

export default Waveform
