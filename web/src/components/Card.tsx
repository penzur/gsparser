import { JSX } from "solid-js";

export default function Card(props: { children?: JSX.Element, class?: string, onClick?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> }) {
    return <div onClick={props.onClick} class={`shadow-[4px_4px_0px_rgba(0,0,0,1)] border border-black ${props.class}`}>
        {props.children}
    </div>;
};
