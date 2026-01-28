import { useState } from "react";
import { Button } from "./ui/button";
import { Check, Copy } from "lucide-react";

export default function CopyButton({ text, label }: { text: string; label?: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Button
            variant="secondary"
            className="w-full cursor-pointer"
            onClick={handleCopy}
        >
            {copied ? (
                <>
                    <Check className="w-4 h-4 mr-2" />
                    Zkopírováno
                </>
            ) : (
                <>
                    <Copy className="w-4 h-4 mr-2" />
                    {label || "Kopírovat"}
                </>
            )}
        </Button>
    )
}