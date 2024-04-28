import { JSX } from "solid-js";

export default function Card(props: { children?: JSX.Element, class?: string }) {
    return <div class={`shadow-[4px_4px_0px_rgba(0,0,0,1)] bg-white border border-black ${props.class}`}>
        {props.children}
    </div>;
};
