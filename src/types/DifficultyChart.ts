export interface DifficultyChart {
    name: string;
    level: number;
    type: string;
    sections: DifficultyChartSection[];
}

export interface DifficultyChartSection {
    name: string;
    order: number;
    songs: DifficultyChartSong[];
}

export interface DifficultyChartSong {
    id: string;
    difficulty: number;
}