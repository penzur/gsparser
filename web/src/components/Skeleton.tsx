import { For, createSignal } from "solid-js";

export default function Skeleton(props: { count?: number }) {
    const [ready, setReady] = createSignal(false);

    setTimeout(() => {
        setReady((r) => !r);
    }, 200);

    return <div role="status" class={`${ready() ? 'block' : 'hidden'} bg-white border w-full p-4 space-y-4 divide-gray-200 rounded shadow animate-pulse dark:divide-gray-700 md:p-6 dark:border-gray-700`}>
        <For each={Array(props.count || 5)}>
            {() =>
                <div class="flex items-center justify-between">
                    <div>
                        <div class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5"></div>
                        <div class="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                    </div>
                    <div class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12"></div>
                </div>
            }
        </For>
        <div class="sr-only">Loading...</div>
    </div>;
}
