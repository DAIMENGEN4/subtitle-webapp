import React from "react";
import Icon from "@ant-design/icons";
import {StyleUtil} from "@R/utils/style-util.ts";

export const LargeModelIcon01: React.FC<{ width: number, height: number, color: string }> = (props) => {
    const largeModelIcon = () => (
        <svg className="large-model-icon-01" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
             width={`${StyleUtil.numberToPixels(props.width)}`} height={`${StyleUtil.numberToPixels(props.height)}`}>
            <path
                d="M484.067556 449.706667l56.718222 147.342222a46.648889 46.648889 0 0 0 25.486222 24.234667c10.979556 4.096 22.983111 3.413333 33.564444-2.048a48.071111 48.071111 0 0 0 22.926223-27.079112 54.499556 54.499556 0 0 0-0.455111-37.091555L541.354667 379.448889c-23.552-50.858667-91.420444-50.915556-114.972445-0.113778l-80.782222 175.672889a53.930667 53.930667 0 0 0 7.566222 54.613333 45.511111 45.511111 0 0 0 14.165334 11.434667 41.642667 41.642667 0 0 0 34.417777 1.706667 47.047111 47.047111 0 0 0 25.372445-25.713778l56.888889-147.399111z"
                fill={props.color}></path>
            <path
                d="M634.652444 403.911111c0-11.946667 4.551111-23.324444 12.686223-31.687111a42.666667 42.666667 0 0 1 30.72-13.084444 42.666667 42.666667 0 0 1 30.663111 13.084444 45.568 45.568 0 0 1 12.686222 31.687111v177.038222a46.08 46.08 0 0 1-12.686222 31.687111 43.292444 43.292444 0 0 1-30.72 13.141334 42.097778 42.097778 0 0 1-30.663111-13.084445 44.942222 44.942222 0 0 1-12.686223-31.744V403.911111zM514.389333 57.628444C742.798222 54.442667 794.396444 199.509333 796.444444 274.090667c-290.588444-149.617778-643.982222-52.451556-721.351111 169.528889-102.058667-329.386667 250.311111-394.581333 439.296-385.991112z"
                fill={props.color}></path>
            <path
                d="M881.208889 667.875556c-96.824889 209.237333-246.158222 198.257778-312.32 170.439111 257.592889-204.913778 326.542222-565.475556 166.115555-724.536889 332.629333 38.684444 236.088889 385.536 146.204445 554.097778z"
                fill={props.color}></path>
            <path
                d="M160.142222 642.958222C54.727111 433.095111 153.486222 320 215.324444 284.444444c4.949333 336.384 245.76 619.463111 467.342223 590.961778-231.196444 242.915556-444.643556-53.703111-522.410667-232.391111h-0.113778z"
                fill={props.color}></path>
        </svg>
    )
    return <Icon component={largeModelIcon} {...props}/>
}