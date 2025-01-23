import * as React from "react";
import {useMemo, useState} from "react";
import {Welcome} from "@ant-design/x";
import {Popup, Space} from "antd-mobile";
import {SubtitleInfo} from "@R/info/subtitle-info.ts";
import {useWebappSelector} from "@R/store/webapp-hook.ts";
import {Language} from "@R/contants/language.ts";
import {SubtitleLayout} from "@R/contants/subtitle-layout.ts";
import {SpeakerIcon01} from "@R/assets/svg/speaker-icon-01.tsx";
import {Flex} from "antd";
import {LikeIcon01} from "@R/assets/svg/like-icon-01.tsx";
import {MoreIcon01} from "@R/assets/svg/more-icon-01.tsx";
import {DisplayBlock} from "@R/components/display-block/display-block.tsx";

export const SubtitleItem: React.FC<{
    subtitleInfo: SubtitleInfo;
}> = ({subtitleInfo}) => {
    const divStyle = useMemo(() => ({
        padding: 10,
        paddingBottom: 0,
    }), []);
    const welcomeStyle = useMemo(() => ({
        backgroundImage: 'linear-gradient(97deg, rgba(90,196,255,0.12) 0%, rgba(174,136,255,0.12) 100%)',
        borderStartStartRadius: 4,
    }), []);
    const [visible, setVisible] = useState(false);
    const room = useWebappSelector(state => state.session.room);
    const fontSize = useWebappSelector(state => state.static.fontSize);
    const displayTime = useWebappSelector(state => state.static.displayLayout.includes(SubtitleLayout.TIME));
    const displayRoom = useWebappSelector(state => state.static.displayLayout.includes(SubtitleLayout.ROOM));
    const displaySpeaker = useWebappSelector(state => state.static.displayLayout.includes(SubtitleLayout.SPEAKER));
    const displayChinese = useWebappSelector(state => state.static.displayLanguage.includes(Language.CHINESE));
    const displayEnglish = useWebappSelector(state => state.static.displayLanguage.includes(Language.ENGLISH));
    const displayJapanese = useWebappSelector(state => state.static.displayLanguage.includes(Language.JAPANESE));
    return (
        <div style={divStyle}>
            <Welcome style={welcomeStyle}
                     title={<div className={"text-subtitle-room"} style={{fontSize: 14}}>
                         <Flex justify={"space-between"}>
                             <Space align={"start"}>
                                 {displayTime && <span>{subtitleInfo.time}</span>}
                                 {displayRoom && <span>{room}</span>}
                                 {displaySpeaker && <span>{subtitleInfo.speaker}</span>}
                             </Space>
                             <Space align={"end"} style={{'--gap': '20px'}}>
                                 <div onClick={() => setVisible(true)}>
                                     <SpeakerIcon01 width={15} height={15} color={"#fff"}/>
                                 </div>
                                 <div onClick={() => setVisible(true)}>
                                     <LikeIcon01 width={15} height={15} color={"#fff"}/>
                                 </div>
                                 <div onClick={() => setVisible(true)}>
                                     <MoreIcon01 width={15} height={15} color={"#fff"}/>
                                 </div>
                             </Space>
                         </Flex>
                     </div>}
                     description={<div style={{fontSize: fontSize}}>
                         <Space direction={"vertical"} style={{'--gap': '10px'}}>
                             {displayChinese && <div className={"text-subtitle-chinese"}>{subtitleInfo.chinese}</div>}
                             {displayEnglish && <div className={"text-subtitle-english"}>{subtitleInfo.english}</div>}
                             {displayJapanese &&
                                 <div className={"text-subtitle-japanese"}>{subtitleInfo.japanese}</div>}
                         </Space>
                     </div>}/>

            <Popup visible={visible} onMaskClick={() => setVisible(false)}>
                <DisplayBlock title={"这个功能正在被神秘魔法打造中！"}>
                    <span style={{fontSize: 16, padding: 10, color: "#697b8c"}}>代码如潮，函数归位，错误消散，程序顺畅！</span>
                </DisplayBlock>
            </Popup>
        </div>
    )
}