export interface LogSummary {
    date: number;
    server: string;
    server_name: string;
    winner: string;
    mvp: string;
}

export interface LogsProp {
    logs: LogSummaries;
};

export type LogSummaries = Array<LogSummary>;

function Log(props: LogSummary) {
    return <div class="flex code border-b border-r border-l border-black cursor-pointer hover:bg-blue-100">
        <div class="p-3 flex-1">{(new Date(props.date)).toLocaleDateString()}</div>
        <div class="p-3 flex-1">{props.server_name}</div>
        <div class="p-3 flex-1">{props.winner}</div>
        <div class="p-3 flex-1">{props.mvp}</div>
    </div>;
};

export default function Logs(props: LogsProp) {
    const logs = () => props.logs;
    return <div class="border-b-4 border-r-4 border-black">
        <div class="bg-black flex text-white text-sm border border-black">
            <div class="pl-3 pt-1 pb-1 pr-3 flex-1">DATE</div>
            <div class="pl-3 pt-1 pb-1 pr-3 flex-1">SERVER</div>
            <div class="pl-3 pt-1 pb-1 pr-3 flex-1">WINNER</div>
            <div class="pl-3 pt-1 pb-1 pr-3 flex-1">MVP</div>
        </div>
        {logs().map(l => <Log {...l} />)}
    </div>;
};
