import Card from "./components/Card"

export default function NotFound() {
    return <div class="flex flex-grow h-full items-center justify-center">
        <Card class="p-10">
            <h1 class="text-5xl mb-4">404</h1>
            <p class="text-gray-700">The page you're looking for could not be found.</p>
        </Card>
    </div>
};
