import { projects } from '../config/profile';
import SectionHeading from './SectionHeading';
import ProjectCard from './projects/ProjectCard';
import Reveal from './Reveal';

export default function Projects() {
  return (
    <section id="projects" aria-labelledby="projects-title" className="scroll-mt-24 py-[var(--m-section-y)] lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="04 — Featured Projects" title="Selected work" id="projects-title">
            <p>
              Project screenshots and repository links are placeholders until they are ready to publish. No metrics or
              business results are claimed.
            </p>
          </SectionHeading>
        </Reveal>

        <Reveal stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-14 lg:gap-7">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
