import React, { useEffect, useState } from 'react'

type Props = {
    data?: any
    selected?: string
    setSelected?: (value: string) => void
}

export default function TrackSelector({ data, selected, setSelected }: Props) {
    const [items, setItems] = useState<any[]>([])

    useEffect(() => {
        if (data && Object.values(data).length) setItems(Object.values(data))
    }, [data])

    return (
        <div className="trackselector__container">
            <div className='trackselector__headers'>
                <div style={{ width: '40%' }}><p className="trackselector__item-value trackselector__item-header">Title</p></div>
                <div style={{ width: '40%' }}><p className="trackselector__item-value trackselector__item-header">Artist</p></div>
                <div style={{ width: '10%' }}> <p className="trackselector__item-value trackselector__item-header">BPN</p></div>
            </div>

            {items.map((item, i) =>
                <div
                    key={i}
                    className='trackselector__item'
                    style={{
                        borderTop: i !== 0 ? '1px solid #262626' : '',
                        backgroundColor: selected === item.id ? '#353535' : '',
                        paddingTop: i === 0 ? '1.5vw' : ''
                    }}
                    onClick={() => setSelected ? selected !== item.id ? setSelected(item.id) : setSelected('') : null}>
                    <div style={{ width: '40%' }}><p className='trackselector__item-value' >{item.title}</p></div>
                    <div style={{ width: '40%' }}><p className='trackselector__item-value' >{item.artist}</p></div>
                    <div style={{ width: '10%' }}><p className='trackselector__item-value' >{item.bpn}</p></div>
                </div>)}
        </div>
    )
}