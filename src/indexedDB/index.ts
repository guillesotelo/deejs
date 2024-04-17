
export const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open('audioDB', 1)

        request.onerror = (event: Event) => {
            console.error('Error opening database:', (event.target as IDBRequest).error)
            reject((event.target as IDBRequest).error)
        }

        request.onsuccess = (event: Event) => {
            const db = (event.target as IDBOpenDBRequest).result as IDBDatabase
            // console.log('Database opened successfully')
            resolve(db)
        }

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            const db = (event.target as IDBOpenDBRequest).result as IDBDatabase
            db.createObjectStore('audioStore', { keyPath: 'id' })
            console.log('Audio DB created')
        }
    })
}

export const saveAudioToDB = async (trackData: any): Promise<void> => {
    try {
        const db = await openDB()
        const transaction = db.transaction(['audioStore'], 'readwrite')
        const store = transaction.objectStore('audioStore')
        const request = store.put(trackData)

        request.onsuccess = () => {
            console.log('New audio saved to IndexedDB')
        }

        request.onerror = (event: Event) => {
            console.error('Error saving audio to IndexedDB:', (event.target as IDBRequest).error)
        }
    } catch (error) {
        console.error('Error opening IndexedDB:', error)
    }
}

export const getAudioFromDB = async (id: string): Promise<Blob | null> => {
    try {
        const db = await openDB()
        const transaction = db.transaction(['audioStore'], 'readonly')
        const store = transaction.objectStore('audioStore')
        const request = store.get(id)

        return new Promise((resolve, reject) => {
            request.onsuccess = (event: Event) => {
                const audioTrack = (event.target as IDBRequest).result
                resolve(audioTrack)
            }

            request.onerror = (event: Event) => {
                console.error('Error retrieving audio from IndexedDB:', (event.target as IDBRequest).error)
                reject((event.target as IDBRequest).error)
            }
        })
    } catch (error) {
        console.error('Error opening IndexedDB:', error)
        return null
    }
}

export const getAllRecordsFromDB = async (): Promise<{ [key: string]: any }> => {
    try {
        const db = await openDB()
        const transaction = db.transaction(['audioStore'], 'readonly')
        const store = transaction.objectStore('audioStore')
        const request = store.openCursor()

        return new Promise((resolve, reject) => {
            const records: { [key: string]: any } = {}

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result as IDBCursorWithValue
                if (cursor) {
                    const record = cursor.value
                    records[record.id] = record
                    cursor.continue()
                } else {
                    resolve(records)
                }
            }

            request.onerror = (event) => {
                console.error('Error retrieving records from IndexedDB:', (event.target as IDBRequest).error)
                reject((event.target as IDBRequest).error)
            }
        })
    } catch (error) {
        console.error('Error opening IndexedDB:', error)
        return {}
    }
}