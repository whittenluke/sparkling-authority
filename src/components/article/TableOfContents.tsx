import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown, ChevronUp, Menu } from 'lucide-react';

interface TableOfContentsProps {
  headings: { id: string; text: string; level: number }[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Find the nearest h2 ancestor or the element itself if it's an h2
            const h2Element = entry.target.tagName === 'H2' 
              ? entry.target 
              : entry.target.closest('section');
            
            if (h2Element) {
              setActiveId(h2Element.id);
            }
          }
        });
      },
      { rootMargin: '0% 0% -80% 0%', threshold: 0.1 }
    );

    // Observe both h2 sections and their content
    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        // If it's an h2, observe its entire section
        if (element.tagName === 'H2') {
          const section = element.closest('section');
          if (section) {
            observer.observe(section);
          }
        }
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  // Group headings by their parent H2
  const groupedHeadings = headings.reduce((acc, heading) => {
    if (heading.level === 2) {
      acc[heading.id] = {
        title: heading.text,
        id: heading.id,
        subheadings: []
      };
    } else if (heading.level === 3) {
      const parentH2 = headings.findLast(h => h.level === 2 && headings.indexOf(h) <= headings.indexOf(heading));
      if (parentH2) {
        acc[parentH2.id].subheadings.push(heading);
      }
    }
    return acc;
  }, {} as Record<string, { title: string; id: string; subheadings: typeof headings }>);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const renderTableOfContents = (showHeader = true) => (
    <nav className="space-y-2 text-sm">
      {showHeader && <p className="font-medium mb-4 text-foreground">Table of Contents</p>}
      {Object.values(groupedHeadings).map(({ title, id, subheadings }) => (
        <div key={id} className="mb-3">
          <div className="flex items-center justify-between">
            <a
              href={`#${id}`}
              className={cn(
                'block text-muted-foreground hover:text-foreground transition-colors',
                {
                  'font-medium text-foreground': activeId === id
                }
              )}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                setIsMobileOpen(false);
              }}
            >
              {title}
            </a>
            {subheadings.length > 0 && (
              <button
                onClick={() => toggleSection(id)}
                className="p-1 hover:bg-muted rounded-sm"
              >
                {expandedSections[id] ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
          {expandedSections[id] && subheadings.length > 0 && (
            <div className="ml-4 mt-2 space-y-2 border-l pl-2">
              {subheadings.map((subheading) => (
                <a
                  key={subheading.id}
                  href={`#${subheading.id}`}
                  className={cn(
                    'block text-sm text-muted-foreground hover:text-foreground transition-colors',
                    {
                      'font-medium text-foreground': activeId === subheading.id || activeId === id
                    }
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(subheading.id)?.scrollIntoView({ behavior: 'smooth' });
                    setIsMobileOpen(false);
                  }}
                >
                  {subheading.text}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop: Sticky Sidebar */}
      <div className="hidden lg:block sticky top-4 w-64 max-h-[calc(100vh-2rem)] overflow-y-auto">
        {renderTableOfContents(true)}
      </div>

      {/* Mobile: Floating button and overlay */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed bottom-4 right-4 bg-primary text-primary-foreground p-3 rounded-full shadow-lg z-50"
          aria-label="Open table of contents"
        >
          <Menu className="h-6 w-6" />
        </button>

        {isMobileOpen && (
          <div className="fixed inset-0 bg-background/95 backdrop-blur z-50 p-4">
            <div className="max-w-lg mx-auto pt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-foreground">Table of Contents</h2>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 hover:bg-muted rounded-full text-foreground"
                  aria-label="Close table of contents"
                >
                  ✕
                </button>
              </div>
              {renderTableOfContents(false)}
            </div>
          </div>
        )}
      </div>
    </>
  );
} 