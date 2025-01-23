import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {ChatRespond} from "subtitle-webapp-grpc-web";
import {Language} from "@R/contants/language.ts";

dayjs.extend(utc)

export class SubtitleInfo {
    public readonly time: string;
    public readonly speaker: string;
    public readonly chinese: string;
    public readonly english: string;
    public readonly japanese: string;

    constructor(response: ChatRespond) {
        this.speaker = response.getSpeaker();
        const languageList = response.getTargetLanguageList();
        const subtitleList = response.getTranslatedTextList();
        const chineseIndex = languageList.indexOf(Language.CHINESE);
        const englishIndex = languageList.indexOf(Language.ENGLISH);
        const japaneseIndex = languageList.indexOf(Language.JAPANESE);
        this.time = dayjs.unix(response.getStart()).utc().format("HH:mm:ss");
        this.chinese = chineseIndex !== -1 ? subtitleList[chineseIndex] : "";
        this.english = englishIndex !== -1 ? subtitleList[englishIndex] : "";
        this.japanese = japaneseIndex !== -1 ? subtitleList[japaneseIndex] : "";
    }
}