import { A } from "@solidjs/router"

export default function Footer() {
    return <footer class="text-center w-full flex items-center justify-center uppercase">
        <div class="tracking-wide pt-10 pb-10 code md:lg:w-1/2 sm:w-full h-full text-xs sm:text-sm">
            Made by <A class="font-bold text-blue-700 hover:underline underline-offset-8" href="https://penzur.xyz">@penzur</A>
            <span class="mr-2 ml-2 opacity-30">|</span>Buy me a <A class="font-bold text-blue-700 hover:underline underline-offset-8" href="https://ko-fi.com/penzur">coffee</A>
        </div>
    </footer>
};
