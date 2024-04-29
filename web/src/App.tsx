import type { Component } from 'solid-js';
import { RouteSectionProps } from '@solidjs/router';

import Header from "./Header";
import Footer from "./Footer";

import { MetaProvider } from '@solidjs/meta';
const App: Component<RouteSectionProps> = (props) => {
    return <MetaProvider><div class="flex flex-col h-screen items-center">
        <Header />
        <main class="flex-grow w-10/12 lg:w-2/3 xl:w-1/2">
            {props.children}
        </main>
        <Footer />
    </div></MetaProvider>;
};

export default App;
