import { createResource, Switch, Match } from "solid-js";
import { useParams } from "@solidjs/router";
import { Title } from "@solidjs/meta";

import Card from '../components/Card';
import Skeleton from '../components/Skeleton';
import MenuList from "../components/MenuList";
import Summaries from '../components/logs/Summaries';

import { LogSummaries, fetchServers, fetchSummaries } from "../services/log";

export default function Home() {
    const params = useParams<{ server?: string }>();
    const server = () => params.server || '';
    const [summaries] = createResource<LogSummaries, string>(server, fetchSummaries);
    const [servers] = createResource(fetchServers);

    const serverName = (): string => {
        return servers()?.find(s => s.id === server())?.name || 'Recent';
    };

    return <>
        <Title><>gsparser - {serverName} Siege Logs</></Title>

        <Switch>
            <Match when={servers.loading || summaries.loading}>
                <div class="text-3xl w-full pb-10 pt-10 md:pb-20 md:pt-20 text-center sm:text-4xl md:text-5xl lg:text-5xl">
                    <Skeleton count={1} />
                </div>
            </Match>

            <Match when={serverName()}>
                <h1 class="text-3xl font-extralight w-full p-10 md:p-20 text-center sm:text-4xl md:text-5xl lg:text-5xl">
                    {serverName()} Siege Logs
                </h1>
            </Match>
        </Switch>

        <div class="flex md:flex-row w-full flex-col">
            <div class="md:w-1/3 md:mr-6 sm:w-full mb-6">
                <Switch>
                    <Match when={servers.loading || summaries.loading}>
                        <Skeleton count={3} />
                    </Match>

                    <Match when={servers()}>
                        <MenuList items={servers()} selected={server()} />
                    </Match>
                </Switch>
            </div>

            <Switch>
                <Match when={summaries.loading}>
                    <Skeleton />
                </Match>

                <Match when={summaries()!.length === 0}>
                    <Card class="bg-white w-full uppercase text-sm flex flex-col items-center justify-center p-10">
                        <h3 class="font-light block text-2xl opacity-50">No Logs Found</h3>
                    </Card>
                </Match>

                <Match when={summaries()}>
                    <Summaries {...summaries()!} />
                </Match>
            </Switch>
        </div>
    </>;
};
