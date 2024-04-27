import { createResource, Show, Switch, Match } from "solid-js";

import Logs, { LogSummaries } from '../components/logs/Logs';
import Skeleton from '../components/Skeleton';

const fetchLogs = async (): Promise<LogSummaries> => {
    await new Promise((ok) => {
        setTimeout(ok, 3000)
    });
    const response = await fetch('/api/v1/logs');
    return response.json();
};

export default function Home() {
    const [logs] = createResource(fetchLogs);
    return <>
        <Show when={logs.loading}>
            <Skeleton />
        </Show>
        <Switch>
            <Match when={logs.error}>
                <p>Could not fetch logs. Try again later.</p>
            </Match>
            <Match when={logs()}>
                <Logs logs={logs()!} />
            </Match>
        </Switch>
    </>;
};
