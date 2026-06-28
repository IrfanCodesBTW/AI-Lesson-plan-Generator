import { SectionCard } from '../ui/SectionCard';
export function ResourcesTab() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <SectionCard title="Teaching Resources & Standards">
        <div
          className="space-y-4 text-sm leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <p>
            Welcome to the Curriculum Resources page. These guides help align generated lesson plans
            with early childhood educational metrics:
          </p>
          <ul className="list-inside list-disc space-y-3 font-semibold text-text-secondary">
            <li>
              <span className="font-black text-text-primary">Physical Development:</span> Ensure
              classroom activities incorporate safe, gross/fine motor skill exercises suitable for
              younger groups (Ages 2-3).
            </li>
            <li>
              <span className="font-black text-text-primary">Language Literacy:</span> Leverage the
              &quot;Rhyme&quot; sections to foster word associations, phonemic patterns, and
              language fluency.
            </li>
            <li>
              <span className="font-black text-text-primary">Worksheet Integration:</span> Worksheet
              ideas should involve simple drawings or matching exercises rather than reading/writing
              tasks for children under age 5.
            </li>
          </ul>
        </div>
      </SectionCard>
    </div>
  );
}
