import { Title } from "@solidjs/meta";
import { For, Match, Switch, createEffect, createResource, createSignal } from "solid-js";
import Skeleton from "../components/Skeleton";
import Card from "../components/Card";
import { useNavigate } from "@solidjs/router";

const fetchServers = async (): Promise<Array<{ id: string, name: string, private: boolean }>> => {
    const response = await fetch('/api/v1/servers');
    return response.json();
};

const uploadLog = async (data: FormData): Promise<any> => {
    const response = await fetch('/api/v1/logs', {
        method: 'POST',
        body: data,
    });
    return response.json();
};

export default function Upload() {
    const navigate = useNavigate();
    const [servers] = createResource(fetchServers);
    const [form, setForm] = createSignal<FormData | undefined>();
    const [uploadResponse] = createResource<any, FormData>(form, uploadLog);

    createEffect(() => {
        if (uploadResponse()) {
            navigate(`/${uploadResponse().server}/${uploadResponse().date}`);
        }
    });
    return <>
        <Title><>gsparser - Upload Log</></Title>
        <h1 class="text-3xl w-full p-10 md:p-20 text-center sm:text-4xl md:text-5xl lg:text-5xl">
            <Switch>
                <Match when={!servers()}>
                    <Skeleton count={1} />
                </Match>
                <Match when={servers()}>
                    <span>Upload Log</span>
                </Match>
            </Switch>
        </h1>
        <div class="flex md:flex-row w-full items-center justify-center">
            <div class="w-10/12 md:w-1/2 border">
                <Switch>
                    <Match when={!servers()}>
                        <Skeleton count={1} />
                    </Match>
                    <Match when={servers()}>
                        <Card class="bg-white p-10 text-xs sm:text-base">
                            <form id="log-form" onSubmit={(e) => { e.preventDefault(); setForm(new FormData(e.currentTarget)) }}>
                                <div class="border border-black pr-2 mb-4 relative">
                                    <select disabled={uploadResponse.loading} name="server" id="server" form="log-form" class="w-full p-2 cursor-pointer">
                                        <For each={servers()}>
                                            {(s) => <option value={s.id}>{s.name}</option>}
                                        </For>
                                    </select>
                                </div>
                                <input disabled={uploadResponse.loading} type="file" accept="text/plain" name="file" id="file" class="disabled:text-gray-300 mb-4" />
                                <button disabled={uploadResponse.loading} class="w-full p-1 mt-6 text-sm lg:text-base font-bold pl-4 pr-4 border-2 bg-green-300 border-black hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition duration-200 disabled:pointer-events-none disabled:bg-gray-300 disabled:opacity-50">
                                    {uploadResponse.loading ? 'Please wait...' : 'SUBMIT'}
                                </button>
                                <p class="mt-4 text-center text-red-600">{uploadResponse.error ? 'Upload failed. Try again.' : ''}</p>
                            </form>
                        </Card>
                    </Match>
                </Switch>
            </div>
        </div>
    </>;
};
