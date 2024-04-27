import { lazy } from 'solid-js';
import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';

import './index.css';
import App from './App';

const Home = lazy(() => import('./pages/Home'));

render(() => <Router root={App}>
    <Route path="/" component={Home} />
</Router>, document.getElementById('root')!);
