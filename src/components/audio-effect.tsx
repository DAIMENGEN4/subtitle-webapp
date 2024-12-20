import robot_1 from "@Root/assets/png/robot_1.png";
import robot_2 from "@Root/assets/png/robot_2.png";
import "./audio-effect.css";
import React from "react";

export const AudioEffect: React.FC<{ isSpeaking: boolean }> = ({ isSpeaking }) => {
    return (
        <div className="robot-container">
            {/*<img className={`image1 ${isSpeaking ? 'jump' : ''}`} src={robot_1} alt="Robot"/>*/}
            <img className={`image1}`} src={robot_1} alt="Robot"/>
            <img className={`image2 ${isSpeaking ? 'zoom' : ''}`} src={robot_2} alt="Robot"/>
        </div>
    );
};
