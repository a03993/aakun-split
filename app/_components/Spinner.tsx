import { Loader2 } from "lucide-react";

export default function Spinner() {
    return (
        <div className="flex flex-1 items-center justify-center">
            <Loader2 size={80} strokeWidth={1.5} className="animate-spin text-lime-500" />
        </div>
    );
}
