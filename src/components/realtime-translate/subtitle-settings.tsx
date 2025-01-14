import {useState} from "react";
import {Button, Card, CheckList, Grid, Image, Modal, Popup, Slider, Space} from "antd-mobile";
import bubble_webp from "@R/assets/jpeg/bubble.jpeg";
import {useWebappDispatch, useWebappSelector} from "@R/store/webapp-hook.ts";
import {SwitchRoomIcon01} from "@R/assets/svg/switch-room-icon-01.tsx";
import {setRoomId} from "@R/store/features/session-slice.ts";
import {FontSizeIcon01} from "@R/assets/svg/font-size-icon-01.tsx";
import {LayoutIcon01} from "@R/assets/svg/layout-icon-01.tsx";
import {LanguageIcon01} from "@R/assets/svg/language-icon-01.tsx";
import {DisplayBlock} from "@R/components/display-block/display-block.tsx";
import {setDisplayLanguage, setDisplayLayout, setFontSize} from "@R/store/features/static-slice.ts";
import {Language} from "@R/contants/language.ts";

export const SubtitleSettings = () => {
    const webappDispatch = useWebappDispatch();
    const container = document.getElementById("root");
    const [isAdjustingSetting, setIsAdjustingSetting] = useState(false);
    const [isAdjustingFontSize, setIsAdjustingFontSize] = useState(false);
    const [isAdjustingLanguage, setIsAdjustingLanguage] = useState(false);
    const [isAdjustingDisplayLayout, setIsAdjustingDisplayLayout] = useState(false);
    const roomId = useWebappSelector(state => state.session.roomId);
    const fontSize = useWebappSelector(state => state.static.fontSize);
    const displayLayout = useWebappSelector(state => state.static.displayLayout);
    const displayLanguage = useWebappSelector(state => state.static.displayLanguage);

    return (
        <div className={"subtitle-settings"}>
            <Image src={bubble_webp} onClick={() => setIsAdjustingSetting(true)}/>
            <Modal
                visible={isAdjustingSetting && !isAdjustingDisplayLayout && !isAdjustingFontSize && !isAdjustingLanguage}
                destroyOnClose={true}
                closeOnMaskClick={true}
                getContainer={container}
                stopPropagation={[]}
                bodyStyle={{paddingTop: "0"}}
                content={
                    <div className={"subtitle-setting-modal"}>
                        <Card title={`Room: ${roomId}`} headerStyle={{display: "flex", justifyContent: "center"}}>
                            <Grid columns={2}>
                                <Grid.Item>
                                    <Space direction={"vertical"} style={{textAlign: "center", width: "100%"}}>
                                        <Button onClick={() => {
                                            setIsAdjustingSetting(false);
                                            webappDispatch(setRoomId(undefined));
                                        }} style={{border: "none"}}>
                                            <SwitchRoomIcon01 width={50} height={50} color={"#91003c"}/>
                                        </Button>
                                        Switch Room
                                    </Space>
                                </Grid.Item>
                                <Grid.Item>
                                    <Space direction={"vertical"} style={{textAlign: "center", width: "100%"}}>
                                        <Button onClick={() => setIsAdjustingFontSize(true)} style={{border: "none"}}>
                                            <FontSizeIcon01 width={50} height={50} color={"#91003c"}/>
                                        </Button>
                                        <span>FontSize</span>
                                    </Space>
                                </Grid.Item>
                                <Grid.Item>
                                    <Space direction={"vertical"} style={{textAlign: "center", width: "100%"}}>
                                        <Button onClick={() => setIsAdjustingDisplayLayout(true)}
                                                style={{border: "none"}}>
                                            <LayoutIcon01 width={50} height={50} color={"#91003c"}/>
                                        </Button>
                                        Layout
                                    </Space>
                                </Grid.Item>
                                <Grid.Item>
                                    <Space direction={"vertical"} style={{textAlign: "center", width: "100%"}}>
                                        <Button onClick={() => setIsAdjustingLanguage(true)} style={{border: "none"}}>
                                            <LanguageIcon01 width={50} height={50} color={"#91003c"}/>
                                        </Button>
                                        Language
                                    </Space>
                                </Grid.Item>
                            </Grid>
                        </Card>
                    </div>
                }
                onClose={() => setIsAdjustingSetting(false)}/>

            <Popup visible={isAdjustingFontSize}
                   onMaskClick={() => setIsAdjustingFontSize(false)}>
                <DisplayBlock title={`FontSize: ${fontSize}`}>
                    <Slider defaultValue={fontSize} max={50} onChange={(value) => {
                        if (typeof value === "number") {
                            webappDispatch(setFontSize(value))
                        }
                    }}/>
                </DisplayBlock>
            </Popup>

            <Popup visible={isAdjustingLanguage}
                   onMaskClick={() => setIsAdjustingLanguage(false)}>
                <DisplayBlock title={"Please select the language you need to translate."}>
                    <CheckList multiple={true} defaultValue={displayLanguage}
                               onChange={(value) => webappDispatch(setDisplayLanguage(value as Array<string>))}>
                        <CheckList.Item value={Language.CHINESE}>Chinese</CheckList.Item>
                        <CheckList.Item value={Language.ENGLISH}>English</CheckList.Item>
                        <CheckList.Item value={Language.JAPANESE}>Japanese</CheckList.Item>
                    </CheckList>
                </DisplayBlock>
            </Popup>

            <Popup visible={isAdjustingDisplayLayout}
                   onMaskClick={() => setIsAdjustingDisplayLayout(false)}>
                <DisplayBlock title={"Please select the layout info you want to display."}>
                    <CheckList multiple={true} defaultValue={displayLayout}
                               onChange={(value) => webappDispatch(setDisplayLayout(value as Array<string>))}>
                        <CheckList.Item value={"time"}>Time</CheckList.Item>
                        <CheckList.Item value={"room"}>Room</CheckList.Item>
                        <CheckList.Item value={"speaker"}>Speaker</CheckList.Item>
                    </CheckList>
                </DisplayBlock>
            </Popup>
        </div>
    )
}