import React, {useEffect, useState} from "react";
import {FloatingBubble} from "antd-mobile";
import {SubtitleSettings} from "@R/components/realtime-translate/subtitle-settings.tsx";

export const SubtitleAssistBall: React.FC<{ parent: React.RefObject<HTMLDivElement> }> = ({parent}) => {
    const [opacity, setOpacity] = useState(1);
    const [offset, setOffset] = useState({x: -24, y: -24});
    useEffect(() => {
        const parentEl = parent.current;
        if (parentEl) {
            const handleClick = (e: MouseEvent) => {
                const target = e.target as HTMLElement;
                setOpacity(opacity => {
                    if (target.tagName === "IMG") {
                        return 1;
                    }
                    return opacity === 1 ? 0.1 : 1;
                });
            };
            parentEl.addEventListener("click", handleClick);
            // Cleanup function to remove the event listener
            return () => parentEl.removeEventListener("click", handleClick);
        }
    }, [parent]);

    return (
        <FloatingBubble axis="xy"
                        style={{
                            opacity: opacity,
                            "--edge-distance": "24px",
                            "--background": "transparent",
                            "--initial-position-right": "0",
                            "--initial-position-bottom": "0",
                            transition: "opacity 1s ease-in-out",
                        }}
                        magnetic={"x"}
                        offset={offset}
                        onOffsetChange={setOffset}>
            <SubtitleSettings/>
        </FloatingBubble>
    )
}