import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {SubtitleInfo} from "@R/model/subtitle-info.ts";

// Ensure the array has at most 100 items
const maxSubtitles = 50;

export type SessionStore = {
    roomId?: string;
    subtitleInfos: Array<SubtitleInfo>;
}

const initialState: SessionStore = {
    roomId: undefined,
    subtitleInfos: []
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
        }
    }
});

export const {
    setRoomId,
    addSubtitleInfo,
    clearSubtitleInfos
} = sessionSlice.actions;
export default sessionSlice.reducer;