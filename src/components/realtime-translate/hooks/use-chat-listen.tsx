import {useCallback} from "react";
import {Toast} from "antd-mobile";
import {RpcError} from "grpc-web";
import {SubtitleInfo} from "@R/model/subtitle-info.ts";
import {ChatRespond, MeetingRoom} from "subtitle-webapp-grpc-web";
import {addSubtitleInfo} from "@R/store/features/session-slice.ts";
import {useWebappDispatch, useWebappSelector} from "@R/store/webapp-hook.ts";
import {useChatServiceClient} from "@R/components/realtime-translate/hooks/use-chat-service-client.tsx";

export const useChatListen = () => {
    const client = useChatServiceClient();
    const webappDispatch = useWebappDispatch();
    const subtitleInfos = useWebappSelector(state => state.session.subtitleInfos);
    const listenSubtitleInfos = useCallback((roomId: string) => {
        const request = new MeetingRoom().setMeetingRoom(roomId);
        const stream = client.chatListen(request, {});
        stream.on("data", (response: ChatRespond) => {
            const subtitle = new SubtitleInfo(response);
            webappDispatch(addSubtitleInfo(subtitle));
        });
        stream.on("error", (error: RpcError) => {
            Toast.show("Error: " + error.message);
        });
        stream.on("end", () => {
            Toast.show("The connection has been disconnected. Please refresh and try reconnecting!");
        });
        return stream;
    }, [client, webappDispatch]);

    return {
        subtitleInfos,
        listenSubtitleInfos
    };
}