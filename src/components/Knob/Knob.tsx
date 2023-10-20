import React, { useEffect } from 'react';
import gsap from 'gsap';
import Draggable from 'gsap/Draggable';
gsap.registerPlugin(Draggable);

interface KnobProps {
    label?: string
}

const Knob: React.FC<KnobProps> = ({ label }) => {
    const maxRotation = 150;
    const minRotation = -150;
    let volume: HTMLDivElement | null = null;
    let wheelDrag: Draggable | null = null;

    useEffect(() => {
        volume = document.getElementById('volumeBar') as HTMLDivElement;

        const volumeBarHolder = document.getElementById('volumeBarHolder');
        if (volumeBarHolder) volumeBarHolder.style.width = (maxRotation + minRotation) * volumeTickWidth + 'px';

        wheelDrag = Draggable.create('#wheel', {
            type: 'rotation',
            bounds: { minRotation, maxRotation }
        })[0];

        if (wheelDrag) {
            wheelDrag.addEventListener('drag', onWheelDrag)
            wheelDrag.addEventListener('click' , (e) => {
                if(e.detail === 2) {
                    // double click
                }
            })
        }

    }, []);

    const volumeTickWidth = 0.05;

    const onWheelDrag = () => {
        setVolumeWidth();
        if (wheelDrag && wheelDrag.rotation === maxRotation) {
            // Max vol
        }
    };

    const setVolumeWidth = () => {
        if (volume && wheelDrag) {
            const width = Math.round(wheelDrag.rotation * volumeTickWidth);
            volume.style.width = width + 'px';
        }
    };

    return (
        <div className='knob__container'>
            <h4 className="knob__label">{label}</h4>
            <svg className='knob__svg' id='wheel' width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="40" stroke="gray" strokeWidth="2" fill="black" />
                <line x1="50" y1="50" x2="50" y2="10" stroke="lightgray" strokeWidth="3" />
            </svg>
        </div>
    );
};

export default Knob;
