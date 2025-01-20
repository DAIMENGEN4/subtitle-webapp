import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Language} from "@R/contants/language.ts";
import {SubtitleLayout} from "@R/contants/subtitle-layout.ts";

export type StaticStore = {
    speaker: string;
    fontSize: number;
    displayLayout: Array<string>;
    displayLanguage: Array<string>;
}

const initialState: StaticStore = {
    speaker: "unknown",
    fontSize: 16,
    displayLayout: [SubtitleLayout.TIME],
    displayLanguage: [Language.ENGLISH],
}

const staticSlice = createSlice({
    name: "static",
    initialState,
    reducers: {
        setSpeaker(state, action: PayloadAction<string>) {
            state.speaker = action.payload;
        },
        setFontSize(state, action: PayloadAction<number>) {
            state.fontSize = action.payload;
        },
        setDisplayLayout(state, action: PayloadAction<Array<string>>) {
            state.displayLayout = action.payload;
        },
        setDisplayLanguage(state, action: PayloadAction<Array<string>>) {
            state.displayLanguage = action.payload;
        }
    }
});

export const {
    setSpeaker,
    setFontSize,
    setDisplayLayout,
    setDisplayLanguage
} = staticSlice.actions;
export default staticSlice.reducer;