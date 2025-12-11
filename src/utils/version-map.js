export const versionMap = {
    'maimai': 'maimai (初代)',
    'maimai PLUS': 'maimai PLUS',
    'maimai GreeN': 'maimai GreeN',
    'maimai GreeN PLUS': 'maimai GreeN PLUS',
    'maimai ORANGE': 'maimai ORANGE',
    'maimai ORANGE PLUS': 'maimai ORANGE PLUS',
    'maimai PiNK': 'maimai PiNK',
    'maimai PiNK PLUS': 'maimai PiNK PLUS',
    'maimai MURASAKi': 'maimai MURASAKi',
    'maimai MURASAKi PLUS': 'maimai MURASAKi PLUS',
    'maimai MiLK': 'maimai MiLK',
    'maimai MiLK PLUS': 'maimai MiLK PLUS',
    'maimai FiNALE': 'maimai FiNALE',
    'maimai でらっくす': '舞萌DX (2019)',
    'maimai でらっくす PLUS': '舞萌DX PLUS',
    'maimai でらっくす Splash': '舞萌DX 2021 (Splash)',
    'maimai でらっくす Splash PLUS': '舞萌DX 2021 (Splash+)',
    'maimai でらっくす UNiVERSE': '舞萌DX 2022 (UNiVERSE)',
    'maimai でらっくす UNiVERSE PLUS': '舞萌DX 2022 (UNiVERSE+)',
    'maimai でらっくす FESTiVAL': '舞萌DX 2023 (FESTiVAL)',
    'maimai でらっくす FESTiVAL PLUS': '舞萌DX 2023 (FESTiVAL+)',
    'maimai でらっくす BUDDiES': '舞萌DX 2024 (BUDDiES)',
    'maimai でらっくす BUDDiES PLUS': '舞萌DX 2024 (BUDDiES+)',
    'maimai でらっくす PRiSM': '舞萌DX 2025 (PRiSM)',
}

export const getVersionName = (originalName) => {
    return versionMap[originalName] || originalName
}
