export default function Header() {
    return <header class="top-0 left-0 w-full z-10 flex items-center justify-center">
        <div class="flex justify-center w-10/12 lg:w-1/2 pb-5 pt-5">
            <nav class="flex-1">
                <a href="/" class="font-black text-4xl text-black">gsparser</a>
            </nav>
            <div class="flex-1 flex items-center justify-end">
                <a href="/submit" class="p-1 font-medium pl-4 pr-4 border-2 bg-blue-300 border-black hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition duration-200">
                    SUBMIT LOG
                </a>
            </div>
        </div>
    </header>
};
