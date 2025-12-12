type PageTitleProps = {
    title: string;
    description?: string;
}

export function PageTitle({ title, description }: PageTitleProps) {
    return (
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">{title}</h1>
            {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
    );
}
