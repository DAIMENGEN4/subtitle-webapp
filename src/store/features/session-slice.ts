import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {SubtitleInfo} from "@R/model/subtitle-info.ts";
import {LargeLanguageModel} from "@R/contants/large-language-model.ts";

// Ensure the array has at most 100 items
const maxSubtitles = 50;

export type SessionStore = {
    roomId?: string;
    subtitleInfos: Array<SubtitleInfo>;
    largeLanguageModel: number;
}

const initialState: SessionStore = {
    roomId: undefined,
    subtitleInfos: [],
    largeLanguageModel: LargeLanguageModel.WHISPER_M1M200
};

const sessionSlice = createSlice({
    name: "session",
    initialState,
    reducers: {
        setRoomId(state, action: PayloadAction<string | undefined>) {
            state.roomId = action.payload;
        },
        addSubtitleInfo(state, action: PayloadAction<SubtitleInfo>) {
            state.subtitleInfos.push(action.payload);
            if (state.subtitleInfos.length > maxSubtitles) {
                state.subtitleInfos.shift();
            }
        },
        clearSubtitleInfos(state) {
            state.subtitleInfos = [];
        },
        changeLargeLanguageModel(state, action: PayloadAction<number>) {
            state.largeLanguageModel = action.payload;
        }
    }
});

export const {
    setRoomId,
    addSubtitleInfo,
    clearSubtitleInfos,
    changeLargeLanguageModel
} = sessionSlice.actions;
export default sessionSlice.reducer;