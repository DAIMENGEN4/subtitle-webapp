import React from "react";
import Icon from "@ant-design/icons";
import {StyleUtil} from "@R/utils/style-util";

export const SwitchRoomIcon01: React.FC<{ width: number, height: number, color: string }> = (props) => {
    const switchRoomIcon = () => (
        <svg className="switch-room-icon-01" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
             width={`${StyleUtil.numberToPixels(props.width)}`} height={`${StyleUtil.numberToPixels(props.height)}`}>
            <path
                d="M458.666667 1024H384V512l256-256h128l256 256v512H458.666667z m10.666666-85.333333h469.333334V554.666667L725.333333 341.333333h-42.666666L469.333333 554.666667v384z m85.333334-768l-64 64-149.333334-149.333334h-42.666666L85.333333 298.666667v384h213.333334v85.333333H0V256L256 0h128l170.666667 170.666667z"
                fill={props.color}></path>
        </svg>
    )
    return <Icon component={switchRoomIcon} {...props}/>
}