import type { Component } from 'solid-js';

import Header from "./Header";
import Footer from "./Footer";
import { RouteSectionProps } from '@solidjs/router';

const App: Component<RouteSectionProps> = (props) => {
    const children = () => props.children;

    return <div class="flex flex-col h-screen">
        <Header />
        <main class="p-3 flex-grow flex items-center justify-center">
            {children()}
        </main>
        <Footer />
    </div>;
};

export default App;
