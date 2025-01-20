import "./join-room.scss";
import React, {useCallback} from "react";
import {Button, CenterPopup, Form, Input} from "antd-mobile";
import {useWebappDispatch, useWebappSelector} from "@R/store/webapp-hook.ts";
import {setRoom} from "@R/store/features/session-slice.ts";
import {setSpeaker} from "@R/store/features/static-slice.ts";

export const JoinRoom: React.FC<{ visible: boolean }> = ({visible}) => {
    const [form] = Form.useForm();
    const webappDispatch = useWebappDispatch();
    const speaker = useWebappSelector(state => state.static.speaker)
    const onSubmit = useCallback(() => {
        const values: { room: string, speaker: string } = form.getFieldsValue();
        const room = values.room;
        const speaker = values.speaker;
        webappDispatch(setRoom(room));
        webappDispatch(setSpeaker(speaker));
    }, [form, webappDispatch]);
    return (
        <CenterPopup visible={visible}>
            <div className={"join-room-container"} style={{padding: 3}}>
                <div className={"title"}>Join Meeting Room</div>
                <Form form={form}
                      initialValues={{room: undefined, speaker: speaker}}
                      footer={
                          <Button block type="submit" color="primary" size="middle" onClick={onSubmit}>
                              Join
                          </Button>
                      }>
                    <Form.Item label={"Room"} name={"room"} rules={[{required: true, message: "Please input room number"}]}>
                        <Input placeholder="Please input room number"/>
                    </Form.Item>
                    <Form.Item label={"Speaker"} name={"speaker"} rules={[{required: true, message: "Please input your name"}]}>
                        <Input placeholder="Please input your name"/>
                    </Form.Item>
                </Form>
            </div>
        </CenterPopup>
    )
}