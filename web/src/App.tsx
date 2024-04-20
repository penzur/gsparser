import type { Component } from 'solid-js';

const App: Component = (props: any) => {
    return <>
        <header class="fixed p-3 text-orange-500 top-0 left-0 w-full">
            <a class="text-4xl font-bold">gsparser</a>
            <span><small>V2.0</small></span>
        </header>
        <main class="p-3 flex items-center justify-center h-screen">
            {props.children}
        </main>
    </>;
};

export default App;
