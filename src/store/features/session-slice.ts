import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Subtitle} from "@R/model/subtitle.ts";

// Ensure the array has at most 100 items
const maxSubtitles = 50;

export type SessionStore = {
    roomId?: string;
    subtitles: Array<Subtitle>;
}

const initialState: SessionStore = {
    roomId: undefined,
    subtitles: []
};

const sessionSlice = createSlice({
    name: "session",
    initialState,
    reducers: {
        setRoomId(state, action: PayloadAction<string | undefined>) {
            state.roomId = action.payload;
        },
        addSubtitle(state, action: PayloadAction<Subtitle>) {
            state.subtitles.push(action.payload);
            if (state.subtitles.length > maxSubtitles) {
                state.subtitles.shift();
            }
        },
        clearSubtitles(state) {
            state.subtitles = [];
        }
    }
});

export const {
    setRoomId,
    addSubtitle,
    clearSubtitles
} = sessionSlice.actions;
export default sessionSlice.reducer;