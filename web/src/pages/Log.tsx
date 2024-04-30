import { Title } from "@solidjs/meta";
import Icon from "../components/Icon";
import Card from "../components/Card";
import { For, Match, Show, Switch, createResource, createSignal } from "solid-js";
import { useParams } from "@solidjs/router";
type Entry = {
    guild: string;
    name: string;
}
    ;
type Player = {
    deaths: Entry[];
    guild: string;
    kills: Entry[];
    name: string;
    points: number;
    resu: number;
};

type Guild = {
    members: string[];
    name: string;
    points: number;
    resu: number;
};

interface LogEntry {
    date: number;
    guilds: Guild[];
    players: Player[];
    server: string;
};

type logInput = {
    server: string;
    date: string;
}
const getLog = async (args: logInput): Promise<LogEntry> => {
    const resp = await fetch(`/api/v1/logs/${args.server}/${args.date}`);
    return resp.json() as Promise<LogEntry>;
}
export default function Log() {
    const [guildIdx, setGuildIdx] = createSignal();
    const [playerIdx, setPlayerIdx] = createSignal();
    const params = useParams();
    const server = () => ({ server: params.server, date: params.date });
    const [entry] = createResource(server, getLog);
    return <>
        <Title>gsparser - Log</Title>

        <h1 class="text-3xl w-full font-extralight p-10 md:p-20 text-center sm:text-4xl md:text-5xl lg:text-5xl">
            {new Date(entry()?.date as number).toLocaleString().split(',')[0]}
        </h1>

        <div class="flex flex-col sm:flex-row w-full">
            <div class="flex-1 mb-4 sm:mr-4">
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
                            <span class="flex">
                                <span class={`border-r ${guildIdx() === g.name ? 'border-white' : 'border-black'} p-3 flex-col flex items-center justify-center w-10`}>
                                    <Switch>
                                        <Match when={i() === 0}>
                                            <span class="inline-block absolute w-6">
                                                <Icon name="crown" color={g.name === guildIdx() ? '#FFFFFF' : '#000000'} />
                                            </span>
                                        </Match>
                                        <Match when={i() > 0}>
                                            <p class={`text-center text-xs ${guildIdx() === g.name ? 'text-white' : 'text-black'} sm:text-sm`}><span>{i() + 1}</span></p>
                                        </Match>
                                    </Switch>
                                </span>
                                <span class="flex-grow flex flex-row">
                                    <span class="flex truncate flex-col p-3 text-xs sm:text-sm flex-1">
                                        <span class="md:whitespace-normal font-bold title={g.name}">
                                            {g.name}
                                        </span>
                                        <span class="text-xs opacity-70 uppercase sm:text-sm">
                                            <small>
                                                {g.members.length} PLAYERS
                                            </small>
                                        </span>
                                    </span>
                                    <span class="flex flex-col text-xs sm:text-sm justify-center w-9">
                                        <span class="">
                                            {g.points}
                                        </span>
                                        <span class="text-xs opacity-70 uppercase sm:text-sm">
                                            <small>PTS</small>
                                        </span>
                                    </span>
                                    <span class="flex flex-col text-xs sm:text-sm justify-center w-9">
                                        <span class="">
                                            {g.resu}
                                        </span>
                                        <span class="text-xs opacity-70 uppercase sm:text-sm">
                                            <small>RES</small>
                                        </span>
                                    </span>
                                </span>
                            </span>
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
                            setPlayerIdx((idx) => {
                                if (idx === p.name) { return undefined; }
                                return p.name;
                            });
                        }} class="cursor-pointer bg-white overflow-x-hidden group code border mb-2 shadow-black hover:bg-green-50 hover:shadow-green-300 transition duration-200">
                            <span class="flex">
                                <span class="border-r border-black p-3 flex-col flex items-center justify-center w-10">
                                    <Switch>
                                        <Match when={p.name === entry()?.players[0].name}>
                                            <span class="inline-block absolute w-6">
                                                <Icon name="medal" />
                                            </span>
                                        </Match>
                                        <Match when={i() > 0 || p.name !== entry()?.players[0].name}>
                                            <p class="text-center text-xs text-black sm:text-sm"><span>{i() + 1}</span></p>
                                        </Match>
                                    </Switch>
                                </span>
                                <span class="flex-grow flex flex-row">
                                    <span class="flex flex-col p-3 text-xs sm:text-sm flex-1">
                                        <span class="font-bold max-w-20 truncate" title={p.name}>
                                            {p.name}
                                        </span>
                                        <span class="text-xs opacity-70 uppercase sm:text-sm truncate max-w-20">
                                            <small>
                                                {p.guild}
                                            </small>
                                        </span>
                                    </span>
                                    <span class="flex flex-col text-xs sm:text-sm justify-center w-9">
                                        <span class="">
                                            {p.points}
                                        </span>
                                        <span class="text-xs opacity-70 uppercase sm:text-sm">
                                            <small>PTS</small>
                                        </span>
                                    </span>
                                    <span class="flex flex-col text-xs sm:text-sm justify-center w-9">
                                        <span class="">
                                            {p.kills.reduce((s: any, n: any) => s.concat(n), []).length}
                                        </span>
                                        <span class="text-xs opacity-70 uppercase sm:text-sm">
                                            <small>K</small>
                                        </span>
                                    </span>
                                    <span class="flex flex-col text-xs sm:text-sm justify-center w-9">
                                        <span class="">
                                            {p.deaths.length}
                                        </span>
                                        <span class="text-xs opacity-70 uppercase sm:text-sm">
                                            <small>D</small>
                                        </span>
                                    </span>
                                    <span class="flex flex-col text-xs sm:text-sm justify-center w-9">
                                        <span class="">
                                            {p.resu}
                                        </span>
                                        <span class="text-xs opacity-70 uppercase sm:text-sm">
                                            <small>RES</small>
                                        </span>
                                    </span>
                                </span>
                            </span>
                            <Show when={playerIdx() === p.name}>
                                <span class="flex bg-black h-1/4">
                                    asdds
                                </span>
                            </Show>
                        </Card>
                    })}
                </For>
            </div>
        </div>
    </>;
}
