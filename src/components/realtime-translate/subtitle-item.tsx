import * as React from "react";
import {useMemo} from "react";
import {Welcome} from "@ant-design/x";
import {Space} from "antd-mobile";
import {SubtitleInfo} from "@R/model/subtitle-info.ts";

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
    return (
        <div style={divStyle}>
            <Welcome style={welcomeStyle}
                     description={<div style={{fontSize: 16}}>
                         <Space direction={"vertical"} style={{'--gap': '10px'}}>
                             <div className={"text-subtitle-chinese"}>{subtitleInfo.chinese}</div>
                             <div className={"text-subtitle-english"}>{subtitleInfo.english}</div>
                             <div className={"text-subtitle-japanese"}>{subtitleInfo.japanese}</div>
                         </Space>
                     </div>}/>
        </div>
    )
}