import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import {WebAppDispatch, WebAppState} from "@R/store/webapp-store";

export const useWebappDispatch = () => useDispatch<WebAppDispatch>();
export const useWebappSelector: TypedUseSelectorHook<WebAppState> = useSelector;
