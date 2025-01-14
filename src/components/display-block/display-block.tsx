import "./display-block.scss";
import type {FC, ReactNode} from "react"

interface Props {
    title: string
    padding?: string
    background?: string
    children?: ReactNode
}

export const DisplayBlock: FC<Props> = props => {
    return (
        <div className={"display-block"}>
            <div className={"title"}>{props.title}</div>
            <div
                className={"main"}
                style={{
                    padding: props.padding,
                    background: props.background,
                }}>
                {props.children}
            </div>
        </div>
    )
}

