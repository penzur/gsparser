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

export default function Logs(props: LogsProp) {
    const logs = () => props.logs;
    return <>
        {logs().map(l => <p>{(new Date(l.date)).toLocaleDateString()} | {l.server_name} | {l.winner} | {l.mvp}</p>)}
    </>;
};
