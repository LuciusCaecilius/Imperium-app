import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
}

export default function PageHeader({ title, description, className, children, ...props }: PageHeaderProps) {
  return (
    <header className={cn('p-4 md:p-6 lg:p-8 space-y-2', className)} {...props}>
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary">{title}</h1>
          {description && (
            <div className="text-muted-foreground mt-1 text-lg">{description}</div>
          )}
        </div>
        {children}
      </div>
      <Separator className="mt-4" />
    </header>
  );
}
