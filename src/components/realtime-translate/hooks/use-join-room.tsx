import {useCallback, useRef} from "react";
import {useWebappDispatch, useWebappSelector} from "@R/store/webapp-hook.ts";
import {Input, InputRef, Modal, Toast} from "antd-mobile";
import {setRoomId} from "@R/store/features/session-slice.ts";
import {DisplayBlock} from "@R/components/display-block/display-block.tsx";

export const useJoinRoom = () => {
    const webappDispatch = useWebappDispatch();
    const inputRoomRef = useRef<InputRef>(null);
    const roomId = useWebappSelector(state => state.session.roomId);
    const joinRoom = useCallback(() => {
        Modal.alert({
            title: "Join the Meeting Room",
            content: (
                <DisplayBlock title={""}>
                    <Input ref={inputRoomRef} placeholder="Please input room number" style={{
                        "--text-align": "center"
                    }} clearable/>
                </DisplayBlock>
            ),
            confirmText: "Join",
            onConfirm: () => {
                const roomId = inputRoomRef.current?.nativeElement?.value;
                if (!roomId) {
                    Modal.alert({
                        title: "Invalid Room Number",
                        content: "Please input room number",
                        confirmText: "OK",
                        onConfirm: () => joinRoom(),
                    }).then();
                } else {
                    Toast.show({content: "Join the room successfully"});
                    webappDispatch(setRoomId(roomId));
                }
            }
        }).then();
    }, [webappDispatch]);
    const closeJoinRoom = useCallback(() => {
        Modal.clear();
    }, []);
    return {roomId, joinRoom, closeJoinRoom}
}