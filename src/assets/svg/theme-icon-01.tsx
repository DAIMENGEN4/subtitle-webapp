import React from "react";
import Icon from "@ant-design/icons";
import {StyleUtil} from "@R/utils/style-util";

export const ThemeIcon01: React.FC<{ width: number, height: number, color: string }> = (props) => {
    const themeIcon = () => (
        <svg className="theme-icon-01" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
             width={`${StyleUtil.numberToPixels(props.width)}`} height={`${StyleUtil.numberToPixels(props.height)}`}>
            <path
                d="M490.24 165.76l382.592 382.464a53.76 53.76 0 0 1 0.512 75.968l-377.152 377.152a53.76 53.76 0 0 1-75.968-0.512L37.76 618.24a54.08 54.08 0 0 1-10.944-61.248l-2.176-2.112h3.264a52.608 52.608 0 0 1 9.28-12.544l364.608-364.544L299.776 75.776a35.84 35.84 0 0 1-0.384-50.624 35.84 35.84 0 0 1 50.688 0.32L490.24 165.76z m90.048 190.528L452.736 228.8 126.72 554.88h652.16L580.288 356.288zM908.992 945.6c-50.88 0-92.16-40.96-92.16-91.456 0-33.664 30.72-91.136 92.16-172.416 61.44 81.28 92.16 138.752 92.16 172.416 0 50.56-41.216 91.456-92.16 91.456z"
                fill={props.color}></path>
        </svg>
    )
    return <Icon component={themeIcon} {...props}/>
}