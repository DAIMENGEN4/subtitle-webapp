import React from "react";
import Icon from "@ant-design/icons";
import {StyleUtil} from "@R/utils/style-util";

export const LayoutIcon01: React.FC<{ width: number, height: number, color: string }> = (props) => {

    const layoutIcon = () => (
        <svg className="layout-icon-01" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
             width={`${StyleUtil.numberToPixels(props.width)}`} height={`${StyleUtil.numberToPixels(props.height)}`}>
            <path
                d="M192 160a32 32 0 0 0-32 32v640c0 17.664 14.336 32 32 32h640a32 32 0 0 0 32-32v-640a32 32 0 0 0-32-32h-640z m-96 32A96 96 0 0 1 192 96h640a96 96 0 0 1 96 96v640a96 96 0 0 1-96 96h-640a96 96 0 0 1-96-96v-640z"
                fill={props.color}></path>
            <path d="M96 341.333333A32 32 0 0 1 128 309.333333h768a32 32 0 0 1 0 64H128A32 32 0 0 1 96 341.333333z"
                  fill={props.color}></path>
            <path
                d="M128 245.333333a32 32 0 0 1 32 32v128a32 32 0 0 1-64 0v-128A32 32 0 0 1 128 245.333333zM896 245.333333a32 32 0 0 1 32 32v128a32 32 0 0 1-64 0v-128a32 32 0 0 1 32-32zM330.666667 640a32 32 0 0 1 32-32H896a32 32 0 0 1 0 64H362.666667a32 32 0 0 1-32-32z"
                fill={props.color}></path>
            <path d="M362.666667 309.333333a32 32 0 0 1 32 32v554.666667a32 32 0 0 1-64 0V341.333333a32 32 0 0 1 32-32z"
                  fill={props.color}></path>
            <path
                d="M266.666667 896a32 32 0 0 1 32-32h128a32 32 0 0 1 0 64H298.666667a32 32 0 0 1-32-32zM896 544a32 32 0 0 1 32 32v128a32 32 0 0 1-64 0v-128a32 32 0 0 1 32-32z"
                fill={props.color}></path>
        </svg>
    )

    return <Icon component={layoutIcon} {...props}/>
}