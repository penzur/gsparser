import { lazy } from 'solid-js';
import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';

import './index.css';
import App from './App';

const Home = lazy(() => import('./pages/Home'));
const Log = lazy(() => import('./pages/Log'));
const Upload = lazy(() => import('./pages/Upload'));
const NotFound = lazy(() => import('./NotFound'));

render(() => <Router root={App}>
    <Route path="/" component={Home} />
    <Route path="/upload" component={Upload} />
    <Route path="/:server" component={Home} />
    <Route path="/:server/:date" component={Log} />
    <Route path="*" component={NotFound} />
</Router>, document.getElementById('root')!);
