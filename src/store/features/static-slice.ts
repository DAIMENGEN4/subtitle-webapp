import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Language} from "@R/contants/language.ts";
import {SubtitleLayout} from "@R/contants/subtitle-layout.ts";

export type StaticStore = {
    fontSize: number;
    displayLayout: Array<string>;
    displayLanguage: Array<string>;
}

const initialState: StaticStore = {
    fontSize: 22,
    displayLayout: [SubtitleLayout.TIME, SubtitleLayout.SPEAKER, SubtitleLayout.SUBTITLE],
    displayLanguage: [Language.CHINESE, Language.ENGLISH, Language.JAPANESE],
}

const staticSlice = createSlice({
    name: "static",
    initialState,
    reducers: {
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
    setFontSize,
    setDisplayLayout,
    setDisplayLanguage
} = staticSlice.actions;
export default staticSlice.reducer;