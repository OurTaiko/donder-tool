export interface Score {
    song_no: number;
    level: number;
    option_flg: (number | string)[];
    tone_flg: number[];
    update_datetime: string;
    highscore_mode: number;
    highscore_datetime: string;
    high_score_result: number[];
    high_score: number;
    best_score_rank: number;
    history: number[];
    song_detail: any;
    IsAP(): boolean;
    IsFC(): boolean;
    IsClear(): boolean;
    IsPlayed(): boolean;
}

interface RawScore{
    song_no: number;
    stage_cnt: number;
    tone_flg: number[];
    update_datetime: string;
    pound_cnt: number;
    option_flg: (number | string)[];
    ok_cnt: number;
    ng_cnt: number;
    level: number;
    highscore_mode: number;
    highscore_datetime: string;
    high_score: number;
    good_cnt: number;
    full_combo_cnt: number;
    dondaful_combo_cnt: number;
    combo_cnt: number;
    clear_cnt: number;
    best_score_rank: number;
    song_detail: any;
}

export function RawToScore(raw: RawScore): Score {
    return {
        song_no: raw.song_no,
        level: raw.level,
        option_flg: raw.option_flg,
        tone_flg: raw.tone_flg,
        update_datetime: raw.update_datetime,
        highscore_mode: raw.highscore_mode,
        highscore_datetime: raw.highscore_datetime,
        high_score: raw.high_score,
        best_score_rank: raw.best_score_rank,
        high_score_result: [raw.good_cnt, raw.ok_cnt, raw.ng_cnt, raw.pound_cnt, raw.combo_cnt],
        history: [raw.stage_cnt, raw.clear_cnt, raw.full_combo_cnt, raw.dondaful_combo_cnt],
        song_detail: raw.song_detail,
        IsAP: () => { return raw.dondaful_combo_cnt > 0; },
        IsFC: () => { return raw.full_combo_cnt > 0; },
        IsClear: () => { return raw.clear_cnt > 0; },
        IsPlayed: () => { return raw.stage_cnt > 0; },
    };
}
