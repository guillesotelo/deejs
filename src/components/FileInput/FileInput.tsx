import React, { SyntheticEvent, useState } from 'react'

type Props = {
    setFile: (data: any) => void
    setFileName: (name: string) => void
    children: React.ReactNode
    inputId: string
    showLayouts?: boolean
}

export default function FileInput({ setFile, setFileName, inputId, children, showLayouts }: Props) {
    const [dragging, setDragging] = useState(false)

    const loadFile = (e: SyntheticEvent) => {
        const { files } = e.target as HTMLInputElement
        if (files) readFile(files)
    }

    const readFile = (files: FileList) => {
        if (files.length > 0 && files[0].type.includes('audio')) {
            const reader = new FileReader()
            reader.onload = (event) => {
                const fileContent = event?.target?.result
                setFile(fileContent)
                setFileName(files[0].name.split('.')[0])
            }
            reader.readAsDataURL(files[0])
        }
    }

    const openFileLoader = () => {
        const input = document.getElementById(inputId)
        if (input) input.click()
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setDragging(false)
        readFile(e.dataTransfer.files)
    }

    return (
        <div
            className="fileinput__container"
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => {
                e.preventDefault()
                setDragging(true)
            }}
            onDragLeave={(e) => {
                e.preventDefault()
                setDragging(false)
            }}
            onDrop={handleDrop}
            style={{ backgroundColor: dragging ? '#babae0' : '' }}
            onClick={openFileLoader}
        >
            {children}
            <input type="file" accept='audio/*' onChange={loadFile} className="fileinput__input" id={inputId} style={{ display: showLayouts ? 'none' : 'block' }} />
        </div>
    )
}
