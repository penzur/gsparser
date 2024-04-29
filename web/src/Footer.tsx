import { A } from "@solidjs/router"

export default function Footer() {
    return <footer class="text-center w-full flex items-center justify-center">
        <div class="p-5 code md:lg:w-1/2 sm:w-full h-full text-sm">
            Made with <span class="text-red-700 text-xl">❤</span> by <A class="font-bold text-blue-700 underline underline-offset-8 tracking-widest" href="https://penzur.xyz">@penzur</A>
            <span class="mr-2 ml-2 opacity-30">|</span>Buy me a <A class="font-bold text-blue-700 underline underline-offset-8 tracking-widest" href="https://ko-fi.com/penzur">coffee</A>
        </div>
    </footer>
};
