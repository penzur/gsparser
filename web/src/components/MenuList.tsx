import { For } from "solid-js";
import Card from "./Card";
import { A } from "@solidjs/router";

export default function MenuList(props: {
    items?: Array<{ id: string, name: string, private: boolean }>,
    selected: string,
}) {
    return <Card class="p-4 h-auto">
        <h3 class="font-medium text-lg md:text-2xl mb-4">Server List</h3>
        <ul class="border-t border-black">
            <For each={props.items}>
                {(item) => <li class="inline-block w-full text-sm sm:text-base">
                    <A
                        href={`/s/${item.id}`}
                        replace={true}
                        class={`transition duration-200 hover:bg-blue-100 tracking-wide w-full inline-block p-2 pl-3 border-b border-black ${props.selected === item.id ? 'bg-blue-300 hover:bg-blue-300 ' : ''}`} >
                        {item.name}
                    </A>
                </li>}
            </For>
        </ul>
    </Card>;
};
