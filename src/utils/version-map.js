// Version Configuration
// isCurrent: Determines if the version is considered "New" for B50 calculation (Best 15)

export const VERSION_CONFIG = [
    { id: 'maimai', name: 'maimai (初代)', isCurrent: false, abbr: '' },
    { id: 'maimai PLUS', name: 'maimai PLUS', isCurrent: false, abbr: '真' },
    { id: 'maimai GreeN', name: 'maimai GreeN', isCurrent: false, abbr: '超' },
    { id: 'maimai GreeN PLUS', name: 'maimai GreeN PLUS', isCurrent: false, abbr: '檄' },
    { id: 'maimai ORANGE', name: 'maimai ORANGE', isCurrent: false, abbr: '橙' },
    { id: 'maimai ORANGE PLUS', name: 'maimai ORANGE PLUS', isCurrent: false, abbr: '晓' },
    { id: 'maimai PiNK', name: 'maimai PiNK', isCurrent: false, abbr: '桃' },
    { id: 'maimai PiNK PLUS', name: 'maimai PiNK PLUS', isCurrent: false, abbr: '樱' },
    { id: 'maimai MURASAKi', name: 'maimai MURASAKi', isCurrent: false, abbr: '紫' },
    { id: 'maimai MURASAKi PLUS', name: 'maimai MURASAKi PLUS', isCurrent: false, abbr: '堇' },
    { id: 'maimai MiLK', name: 'maimai MiLK', isCurrent: false, abbr: '白' },
    { id: 'maimai MiLK PLUS', name: 'maimai MiLK PLUS', isCurrent: false, abbr: '雪' },
    { id: 'maimai FiNALE', name: 'maimai FiNALE', isCurrent: false, abbr: '辉' },
    { id: 'maimai でらっくす', name: '舞萌DX (2019)', isCurrent: false, abbr: '熊' },
    { id: 'maimai でらっくす PLUS', name: '舞萌DX PLUS', isCurrent: false, abbr: '华' },
    { id: 'maimai でらっくす Splash', name: '舞萌DX 2021 (Splash)', isCurrent: false, abbr: '爽' },
    { id: 'maimai でらっくす Splash PLUS', name: '舞萌DX 2021 (Splash+)', isCurrent: false, abbr: '煌' },
    { id: 'maimai でらっくす UNiVERSE', name: '舞萌DX 2022 (UNiVERSE)', isCurrent: false, abbr: '宙' },
    { id: 'maimai でらっくす UNiVERSE PLUS', name: '舞萌DX 2022 (UNiVERSE+)', isCurrent: false, abbr: '星' },
    { id: 'maimai でらっくす FESTiVAL', name: '舞萌DX 2023 (FESTiVAL)', isCurrent: false, abbr: '祭' },
    { id: 'maimai でらっくす FESTiVAL PLUS', name: '舞萌DX 2023 (FESTiVAL+)', isCurrent: false, abbr: '祝' },
    { id: 'maimai でらっくす BUDDiES', name: '舞萌DX 2024 (BUDDiES)', isCurrent: false, abbr: '双' },
    { id: 'maimai でらっくす BUDDiES PLUS', name: '舞萌DX 2024 (BUDDiES+)', isCurrent: false, abbr: '宴' },
    { id: 'maimai でらっくす PRiSM', name: '舞萌DX 2025 (PRiSM)', isCurrent: true, abbr: '镜' },
]

// Helper to get display name
export const getVersionName = (originalName) => {
    const config = VERSION_CONFIG.find(v => v.id === originalName)
    return config ? config.name : originalName
}

// Helper to check if version is current (for B50)
export const isCurrentVersion = (originalName) => {
    const config = VERSION_CONFIG.find(v => v.id === originalName)
    return config ? config.isCurrent : false
}

// Helper to get version abbreviation
export const getVersionAbbr = (originalName) => {
    const config = VERSION_CONFIG.find(v => v.id === originalName)
    return config ? config.abbr : ''
}

// Export map for backward compatibility if needed, or just use getVersionName
export const versionMap = VERSION_CONFIG.reduce((acc, curr) => {
    acc[curr.id] = curr.name
    return acc
}, {})
