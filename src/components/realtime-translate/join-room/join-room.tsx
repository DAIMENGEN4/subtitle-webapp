import "./join-room.scss";
import React, {useCallback} from "react";
import {Button, CenterPopup, Form, Input} from "antd-mobile";
import {useWebappDispatch} from "@R/store/webapp-hook.ts";
import {setRoomId} from "@R/store/features/session-slice.ts";

export const JoinRoom: React.FC<{visible: boolean}> = ({visible}) => {
    const [form] = Form.useForm();
    const webappDispatch = useWebappDispatch();
    const onSubmit = useCallback(() => {
        const values: { roomId: string } = form.getFieldsValue()
        const roomId = values.roomId;
        webappDispatch(setRoomId(roomId));
    }, [form, webappDispatch]);
    return (
        <CenterPopup visible={visible}>
            <div className={"join-room-container"} style={{padding: 3}}>
                <div className={"title"}>Join Meeting Room</div>
                <Form form={form}
                      layout='horizontal'
                      footer={
                          <Button block type="submit" color="primary" size="middle" onClick={onSubmit}>
                              Join
                          </Button>
                      }>
                    <Form.Item name={"roomId"} rules={[{required: true, message: 'Please input room number'}]}>
                        <Input placeholder="Please input room number"/>
                    </Form.Item>
                </Form>
            </div>
        </CenterPopup>
    )
}