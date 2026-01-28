import { ExternalLink } from "lucide-react";
import CopyButton from "./CopyButton";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

type RowProps = {
    label: string;
    value?: string;
    href?: string;
    icon?: React.ReactNode;
    testId?: string;
};

export function Row({ label, value, href, icon, testId }: RowProps) {
    if (icon) {
        return (
            <a href={href} target="_blank" rel="noreferrer" className="flex flex-col items-center hover:bg-[rgba(34,197,94,0.1)] justify-center gap-2 rounded-full border border-primary p-4" data-testid={testId}>
                <div className="w-16 h-16">
                    {icon}
                </div>
                <p className="text-center text-lg font-bold text-white">
                    {label}
                </p>
            </a>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-primary text-sm">{label.toUpperCase()}</CardTitle>
                <CardDescription className="font-mono text-foreground break-all" data-testid={testId + "-value"}>{value}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <CopyButton text={value ?? ""} />
                {href && (
                    <Button asChild>
                        <a href={href} target="_blank" rel="noopener noreferrer" data-testid={testId}>
                            <ExternalLink className="w-4 h-4" />
                            Otevřít
                        </a>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
