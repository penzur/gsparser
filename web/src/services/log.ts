export type Entry = {
    guild: string;
    name: string;
}
    ;
export type Player = {
    deaths: Entry[];
    guild: string;
    kills: Entry[][];
    name: string;
    points: number;
    resu: number;
};

export type Guild = {
    members: string[];
    name: string;
    points: number;
    resu: number;
};

export interface LogEntry {
    date: number;
    guilds: Guild[];
    players: Player[];
    server: string;
};

export type logInput = {
    server: string;
    date: string;
}

export interface LogSummary {
    date: number;
    server: string;
    server_name: string;
    winner: string;
    mvp: string;
}

export type LogSummaries = LogSummary[];

export const fetchSummaries = async (server?: string): Promise<LogSummaries> => {
    let query = '';
    if (server?.length !== 0) {
        query = `?server=${server}`;
    }
    const response = await fetch(`/api/v1/logs${query}`);
    return response.json();
};

export const fetchServers = async (): Promise<Array<{ id: string, name: string, private: boolean }>> => {
    const response = await fetch('/api/v1/servers');
    return response.json();
};
