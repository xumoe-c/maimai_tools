import { getSongById } from '@/services/diving-fish'

export const getRating = (record) => {
    // 1. Get DS
    let ds = record.ds
    let type = record.type
    
    const song = getSongById(record.song_id)
    if (!ds || !type) {
        if (song) {
            if (!ds) ds = song.ds[record.level_index]
            if (!type) type = song.basic_info.from === '舞萌DX' || parseInt(song.id) > 10000 ? 'DX' : 'SD'
            if (!type && song.type) type = song.type
        }
    }
    
    // Fallback if still missing
    if (!ds) ds = 0
    if (!type) type = 'DX'

    // 2. Calculate Rating
    const ach = Math.min(100.5, record.achievements)
    let coeff = 0

    if (ach >= 100.5) coeff = 22.4
    else if (ach >= 100.0) coeff = 21.6
    else if (ach >= 99.5) coeff = 21.1
    else if (ach >= 99.0) coeff = 20.8
    else if (ach >= 98.0) coeff = 20.3
    else if (ach >= 97.0) coeff = 20.0
    else if (ach >= 94.0) coeff = 16.8
    else if (ach >= 90.0) coeff = 15.2
    else if (ach >= 80.0) coeff = 13.6
    else coeff = 0 // Below A?

    const ra = Math.floor(ds * (ach / 100) * coeff)
    
    // 3. Determine if it's a "New" song (Current Version)
    const version = song ? song.basic_info.from : ''
    const isNew = song && song.basic_info ? !!song.basic_info.is_new : false

    return { ...record, ds, type, ra, isNew, version }
}

export const calculateRating = (ds, achievement) => {
    const ach = Math.min(100.5, achievement)
    let coeff = 0

    if (ach >= 100.5) coeff = 22.4
    else if (ach >= 100.0) coeff = 21.6
    else if (ach >= 99.5) coeff = 21.1
    else if (ach >= 99.0) coeff = 20.8
    else if (ach >= 98.0) coeff = 20.3
    else if (ach >= 97.0) coeff = 20.0
    else if (ach >= 94.0) coeff = 16.8
    else if (ach >= 90.0) coeff = 15.2
    else if (ach >= 80.0) coeff = 13.6
    else coeff = 0

    return Math.floor(ds * (ach / 100) * coeff)
}
