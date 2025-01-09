import {useMemo} from "react";
import {hostname} from "@R/host.ts";
import {ChatServiceClient} from "subtitle-webapp-grpc-web/ChatServiceClientPb";

export const useChatServiceClient = () => {
    const options = null;
    const credentials = null;
    return useMemo(() => new ChatServiceClient(hostname, credentials, options), [options, credentials]);
}