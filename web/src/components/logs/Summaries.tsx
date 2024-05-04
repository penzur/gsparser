import { A } from "@solidjs/router";
import Card from "../Card";
import { For } from "solid-js";
import Icon from "../Icon";

const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

import { LogSummaries, LogSummary } from '../../services/log';

function Log(props: LogSummary) {
    const date = new Date(props.date);
    return <Card class="bg-white group code border mb-4 shadow-black hover:bg-green-50 hover:shadow-green-300 transition duration-200">
        <A href={`/${props.server}/${props.date}`}>
            <div class="transition duration-200 group-hover:bg-green-300 group-hover:text-black p-1 pl-3 bg-black flex text-white text-xs sm:text-sm border-b border-black uppercase tracking-widest">
                {props.server_name}
            </div>

            <div class="flex">
                <div class="border-r border-black p-3 flex-col flex items-center justify-center">
                    <p class="text-center font-bold text-lg sm:text-2xl">{date.getDate()}</p>
                    <p class="text-center text-xs sm:text-sm text-black">{months[date.getMonth()]}</p>
                </div>

                <div class="flex-grow block">
                    <div class="flex items-center p-3 text-sm sm:text-base font-bold flex-1 border-b border-black">
                        <div class="inline-block w-6 h-6 mr-3">
                            <Icon name="crown" />
                        </div>
                        {props.winner}
                    </div>

                    <div class="flex items-center p-3 text-sm sm:text-base font-bold flex-1">
                        <div class="inline-block w-6 h-6 mr-3">
                            <Icon name="medal" />
                        </div>
                        {props.mvp}
                    </div>
                </div>
            </div>
        </A>
    </Card>;
};

export default function Logs(props: LogSummaries) {
    const summaries = () => props;
    return <div class="w-full">
        <For each={summaries()}>
            {(summary) => <Log {...summary} />}
        </For>
    </div>;
};
