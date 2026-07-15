import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface IntentCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  ctaText: string;
}

export function IntentCard({ title, description, href, icon: Icon, ctaText }: IntentCardProps) {
  return (
    <Card className="bg-[var(--bg-surface)] border-[var(--border-default)] shadow-[var(--shadow-default)] hover:shadow-[var(--shadow-elevated)] transition-all duration-200 rounded-lg flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="w-12 h-12 rounded-full bg-[var(--accent-light)] flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-[var(--accent-primary)]" strokeWidth={2} />
        </div>
        <CardTitle className="text-[var(--text-primary)] text-xl font-semibold leading-tight">
          {title}
        </CardTitle>
        <CardDescription className="text-[var(--text-secondary)] text-base mt-2 leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow" />
      <CardFooter className="pt-4">
        <Button 
          asChild 
          className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded-md font-medium"
        >
          <Link href={href}>
            {ctaText}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}