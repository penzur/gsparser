import { createResource, Switch, Match } from "solid-js";
import { Title } from "@solidjs/meta";

import Logs, { LogSummaries } from '../components/logs/Logs';
import Skeleton from '../components/Skeleton';
import Card from '../components/Card';
import MenuList from "../components/MenuList";
import { A, useParams } from "@solidjs/router";


const fetchLogs = async (server?: string): Promise<LogSummaries> => {
    let query = '';
    if (server?.length !== 0) {
        query = `?server=${server}`;
    }
    const response = await fetch(`/api/v1/logs${query}`);
    return response.json();
};

const fetchServers = async (): Promise<Array<{ id: string, name: string, private: boolean }>> => {
    const response = await fetch('/api/v1/servers');
    return response.json();
};

export default function Home() {
    const params = useParams();
    const selectedServer = () => params.server || '';
    const [logs] = createResource(selectedServer, fetchLogs);
    const [servers] = createResource(fetchServers);

    const serverName = () => {
        return servers()?.find(s => s.id === selectedServer())?.name || 'Recent';
    };

    return <>
        <Title><>gsparser - {serverName} Siege Logs</></Title>
        <Switch>
            <Match when={servers.loading || logs.loading}>
                <div class="text-3xl w-full pb-10 pt-10 md:pb-20 md:pt-20 text-center sm:text-4xl md:text-5xl lg:text-5xl">
                    <Skeleton count={1} />
                </div>
            </Match>
            <Match when={serverName()}>
                <h1 class="text-3xl w-full p-10 md:p-20 text-center sm:text-4xl md:text-5xl lg:text-5xl">
                    {serverName()} Siege Logs
                </h1>
            </Match>
        </Switch>
        <div class="flex md:flex-row w-full flex-col">
            <div class="md:w-1/3 md:mr-6 sm:w-full mb-6">
                <Switch>
                    <Match when={servers.loading || logs.loading}>
                        <Skeleton count={3} />
                    </Match>
                    <Match when={servers()}>
                        <MenuList items={servers()} selected={selectedServer()} />
                    </Match>
                </Switch>
            </div>
            <Switch>
                <Match when={logs.loading}>
                    <Skeleton />
                </Match>
                <Match when={logs()?.length === 0}>
                    <Card class="w-full uppercase text-sm flex flex-col items-center justify-center p-10">
                        <h3 class="font-light block text-2xl mb-6">No Logs Found</h3>
                        <p class="code text-gray-400">
                            Come back later or <A href="/upload" class="tracking-widest font-bold text-blue-700 underline underline-offset-8">upload</A> a new one.
                        </p>
                    </Card>
                </Match>
                <Match when={logs()}>
                    <Logs logs={logs()!} />
                </Match>
            </Switch>
        </div>
    </>;
};
