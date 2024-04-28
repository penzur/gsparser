import { createResource, Show, Switch, Match } from "solid-js";

import Logs, { LogSummaries } from '../components/logs/Logs';
import Skeleton from '../components/Skeleton';
import Card from '../components/Card';

const fetchLogs = async (): Promise<LogSummaries> => {
    // await new Promise((ok) => {
    //     setTimeout(ok, 5000);
    // })
    const response = await fetch('/api/v1/logs');
    return response.json();
};

export default function Home() {
    const [logs] = createResource(fetchLogs);
    return <>
        <h1 class="text-5xl w-full p-10 text-center">Recent Logs</h1>
        <Show when={logs.loading}>
            <Skeleton />
        </Show>
        <Switch>
            <Match when={logs.error}>
                <Card class="p-10">
                    Error fetching logs. Try again later.
                </Card>
            </Match>
            <Match when={logs()?.length === 0}>
                <div class="flex flex-grow h-full items-center justify-center">
                    <Card class="p-10">
                        No log at the moment. Try again later.
                    </Card>
                </div>
            </Match>
            <Match when={logs()}>
                <Logs logs={logs()!} />
            </Match>
        </Switch>
    </>;
};
