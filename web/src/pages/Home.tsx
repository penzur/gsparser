import { createResource, Show, Switch, Match } from "solid-js";
import { Title } from "@solidjs/meta";

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
        <Title>GS Parser - Recent Logs</Title>
        <h1 class="text-3xl w-full p-10 md:p-20 text-center sm:text-4xl md:text-5xl lg:text-5xl">
            Recent Logs
        </h1>
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
                <div class="flex md:flex-row w-full flex-col">
                    <div class="md:w-1/3 md:mr-6 sm:w-full mb-6">
                        <Card class="p-4">
                            <h3 class="font-light tracking-wider text-2xl mb-4">Server List</h3>
                            <ul>
                                <li><a href="/">All</a></li>
                                <li><a href=""></a></li>
                                <li><a href=""></a></li>
                            </ul>
                        </Card>
                    </div>
                    <Logs logs={logs()!} />
                </div>
            </Match>
        </Switch>
    </>;
};
