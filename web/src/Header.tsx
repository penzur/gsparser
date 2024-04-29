import { A } from "@solidjs/router"

export default function Header() {
    return <header class="backdrop-blur-md border-black border-b sticky top-0 left-0 w-full z-10 flex items-center justify-center">
        <div class="flex justify-center w-10/12 lg:w-2/3 xl:w-1/2 pb-5 pt-5">
            <nav class="flex-1">
                <A href="/" class="font-black text-3xl lg:text-4xl text-black">gsparser</A>
            </nav>
            <div class="flex-1 flex items-center justify-end">
                <A href="/submit" class="p-1 text-sm lg:text-lg font-bold pl-4 pr-4 border-2 bg-blue-300 border-black hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition duration-200">
                    Upload <span class="sm:inline-block hidden">log</span>
                </A>
            </div>
        </div>
    </header >
};
