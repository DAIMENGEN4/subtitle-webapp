import {Route, Routes} from "react-router-dom";
import {HomePage} from "@R/page/home-page/home-page.tsx";
import {RealtimeTranslate} from "@R/components/realtime-translate/realtime-translate.tsx";

export const WebappRoute = () => {

    return (
        <Routes>
            <Route path={"/"} element={<HomePage/>}>
                <Route index element={<RealtimeTranslate/>}/>
                <Route path={"/:_room"} element={<RealtimeTranslate/>}/>
            </Route>
        </Routes>
    )

}