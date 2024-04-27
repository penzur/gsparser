import type { Component } from 'solid-js';

import Header from "./Header";
import Footer from "./Footer";
import { RouteSectionProps } from '@solidjs/router';

const App: Component<RouteSectionProps> = (props) => {
    const children = () => props.children;

    return <div class="flex flex-col h-screen items-center">
        <Header />
        <main class="flex-grow overflow-y-auto w-10/12 lg:w-1/2 ">
            {children()}
        </main>
        <Footer />
    </div>;
};

export default App;
