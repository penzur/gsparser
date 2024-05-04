import { Title } from "@solidjs/meta";
import Icon from "../components/Icon";
import Card from "../components/Card";
import { For, Match, Show, Switch, createResource, createSignal } from "solid-js";
import { useParams } from "@solidjs/router";
import Skeleton from '../components/Skeleton';
import { LogEntry, fetchServers, logInput } from "../services/log";

const fetchLog = async (args: logInput): Promise<LogEntry> => {
    const resp = await fetch(`/api/v1/logs/${args.server}/${args.date}`);
    return resp.json() as Promise<LogEntry>;
}

export default function Log() {
    const params = useParams();
    const args = () => ({ server: params.server, date: params.date });

    const [guildIdx, setGuildIdx] = createSignal();
    const [playerIdx, setPlayerIdx] = createSignal();

    const [entry] = createResource(args, fetchLog);
    const [servers] = createResource(fetchServers);

    const selectedServer = () => servers()?.find(s => s.id === params.server)?.name;

    const date = () => new Date(entry()?.date as number).toLocaleString().split(',')[0].replace(/\//g, '.');

    return <>
        <Title>gsparser - <>{selectedServer} | {date}</></Title>

        <Switch>
            <Match when={entry()}>
                <h1 class="flex flex-col text-3xl w-full p-10 md:p-20 font-extralight text-center sm:text-4xl md:text-5xl lg:text-5xl">
                    <div>{selectedServer()}</div><div class="code font-bold sm:mt-2 text-lg sm:text-3xl">{date()}</div>
                </h1>
            </Match>

            <Match when={!entry()}>
                <div class="text-3xl w-full font-extralight p-10 md:p-20 text-center sm:text-4xl md:text-5xl lg:text-5xl">
                    <Skeleton count={1} />
                </div>
            </Match>
        </Switch>

        <Show when={!entry()}>
            <div class="flex flex-col md:flex-row w-full">
                <div class="flex flex-1 md:mr-4"><Skeleton count={10} /></div>
                <div class="flex flex-1"><Skeleton count={10} /></div>
            </div>
        </Show>

        <Show when={entry()}>
            <div class="flex flex-col md:flex-row w-full">
                <div class="flex-1 mb-6 md:mr-4">
                    <For each={entry()?.guilds}>
                        {((g, i) => {
                            return <Card onClick={(e: MouseEvent) => {
                                e.preventDefault();
                                setGuildIdx(() => {
                                    if (g.name === guildIdx()) {
                                        return undefined;
                                    }
                                    return g.name;
                                });
                            }} class={`cursor-pointer overflow-x-hidden group code border mb-2 ${guildIdx() === g.name ? 'bg-black text-white shadow-green-300' : ' bg-white hover:bg-green-50 hover:shadow-green-300'} transition duration-200`}>
                                <div class="flex">
                                    <div class={`border-r ${guildIdx() === g.name ? 'border-gray-600' : 'border-black'} p-3 flex-col flex items-center justify-center w-10`}>
                                        <Switch>
                                            <Match when={i() === 0}>
                                                <div class="inline-block absolute w-6">
                                                    <Icon name="crown" color={g.name === guildIdx() ? '#FFFFFF' : '#000000'} />
                                                </div>
                                            </Match>
                                            <Match when={i() > 0}>
                                                <p class={`text-center text-xs ${guildIdx() === g.name ? 'text-white' : 'text-black'} sm:text-sm`}><span>{i() + 1}</span></p>
                                            </Match>
                                        </Switch>
                                    </div>

                                    <div class="flex-grow flex flex-row">
                                        <div class="flex flex-col p-3 text-sm sm:text-base flex-1">
                                            <div class="truncate max-w-24 lg:max-w-40 font-bold title={g.name}">
                                                {g.name}
                                            </div>
                                            <div class="text-xs opacity-70 uppercase sm:text-sm">
                                                <small>
                                                    {g.members.length} PLAYERS
                                                </small>
                                            </div>
                                        </div>

                                        <div class="flex flex-col text-sm sm:text-base justify-center w-9">
                                            <div class="">
                                                {g.points}
                                            </div>
                                            <div class="text-xs opacity-70 uppercase sm:text-sm">
                                                <small>PTS</small>
                                            </div>
                                        </div>

                                        <div class="flex flex-col text-sm sm:text-base justify-center w-9">
                                            <div class="">
                                                {g.resu}
                                            </div>
                                            <div class="text-xs opacity-70 uppercase sm:text-sm">
                                                <small>RES</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        })}
                    </For>
                </div>

                <div class="flex-1">
                    <For each={entry()?.players.filter(p => {
                        if (!guildIdx()) { return true; }
                        return guildIdx() === p.guild;
                    })}>
                        {((p, i) => {
                            return <Card onClick={(e) => {
                                e.preventDefault();
                                const ct = e.currentTarget.previousSibling as Element;
                                setPlayerIdx((idx) => {
                                    if (idx === p.name) { return undefined; }
                                    return p.name;
                                });
                                if (ct) {
                                    setTimeout(() => {
                                        ct.scrollIntoView({ behavior: 'smooth' });
                                    }, 500);
                                }
                            }} class={`${playerIdx() === p.name ? 'bg-black text-white shadow-green-300' : 'shadow-black hover:bg-green-50 hover:shadow-green-300'} cursor-pointer bg-white overflow-x-hidden group code border mb-2 transition duration-200`}>
                                <div class="flex">
                                    <div class={`border-r p-3 flex-col flex items-center justify-center w-10 ${playerIdx() === p.name ? 'bg-black border-gray-600' : 'border-black '}`}>
                                        <Switch>
                                            <Match when={p.name === entry()?.players[0].name}>
                                                <div class="inline-block absolute w-6">
                                                    <Icon name="medal" color={`${playerIdx() === p.name ? '#FFFFFF' : '#000000'}`} />
                                                </div>
                                            </Match>
                                            <Match when={i() > 0 || p.name !== entry()?.players[0].name}>
                                                <p class={`text-center text-sm sm:text-base ${playerIdx() === p.name ? 'text-white' : 'text-black'}`}><span>{i() + 1}</span></p>
                                            </Match>
                                        </Switch>
                                    </div>

                                    <div class={`flex-grow flex flex-row ${playerIdx() === p.name ? 'bg-black text-white' : ''}`}>
                                        <div class="flex flex-col p-3 text-sm sm:text-base flex-1">
                                            <div class="font-bold truncate max-w-24 lg:max-w-40" title={p.name}>
                                                {p.name}
                                            </div>

                                            <div class="text-xs opacity-70 uppercase sm:text-sm truncate max-w-20">
                                                <small>
                                                    {p.guild}
                                                </small>
                                            </div>
                                        </div>

                                        <div class="flex flex-col text-sm sm:text-base justify-center w-9">
                                            <div class="">
                                                {p.points}
                                            </div>

                                            <div class="text-xs opacity-70 uppercase sm:text-sm">
                                                <small>PTS</small>
                                            </div>
                                        </div>

                                        <div class="flex flex-col text-sm sm:text-base justify-center w-9">
                                            <div class="">
                                                {p.kills.reduce((s: any, n: any) => s.concat(n), []).length}
                                            </div>

                                            <div class="text-xs opacity-70 uppercase sm:text-sm">
                                                <small>K</small>
                                            </div>
                                        </div>

                                        <div class="flex flex-col text-sm sm:text-base justify-center w-9">
                                            <div class="">
                                                {p.deaths.length}
                                            </div>

                                            <div class="text-xs opacity-70 uppercase sm:text-sm">
                                                <small>D</small>
                                            </div>
                                        </div>

                                        <div class="flex flex-col text-sm sm:text-base justify-center w-9">
                                            <div class="">
                                                {p.resu}
                                            </div>

                                            <div class="text-xs opacity-70 uppercase sm:text-sm">
                                                <small>RES</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Show when={playerIdx() === p.name}>
                                    <div class="flex flex-col bg-gray-700 p-4 text-xs sm:text-sm">
                                        <div class="flex w-full text-white tracking-widest mb-2">
                                            <small class="flex flex-1 font-bold text-green-300">
                                                KILLS
                                            </small>

                                            <small class="flex flex-1 ml-4 font-bold text-red-300">
                                                DEATHS
                                            </small>
                                        </div>

                                        <div class="flex w-full text-white max-h-1/3">
                                            <div class="flex flex-col flex-1 mr-4">
                                                <For each={p.kills}>
                                                    {((a, i) => <>
                                                        <hr class="opacity-10 mt-2 mb-2" />
                                                        <small class="mb-2 text-green-300">LIFE {i() + 1}</small>
                                                        <For each={a}>
                                                            {p => <div class="ml-2 flex flex-col max-w-28 mb-2">
                                                                <strong class="truncate">{p.name}</strong>
                                                                <small class="opacity-50 truncate">{p.guild}</small>
                                                            </div>}
                                                        </For>
                                                    </>)}
                                                </For>
                                            </div>

                                            <div class="flex flex-col flex-1">
                                                <For each={p.deaths}>
                                                    {(p => <>
                                                        <hr class="opacity-10 mt-2 mb-2" />
                                                        <strong>{p.name}</strong>
                                                        <small class="opacity-50">{p.guild}</small>
                                                    </>)}
                                                </For>
                                            </div>
                                        </div>
                                    </div>
                                </Show>
                            </Card>
                        })}
                    </For>
                </div>
            </div>
        </Show>
    </>;
}
