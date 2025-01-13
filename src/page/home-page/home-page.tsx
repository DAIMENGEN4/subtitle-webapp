import {Outlet} from "react-router-dom";

export const HomePage = () => {
    return (
        <div className={"home-page"}>
            <Outlet/>
        </div>
    )
}