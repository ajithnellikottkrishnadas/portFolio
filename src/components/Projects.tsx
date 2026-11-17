import { projects } from '../config/profile';
import SectionHeading from './SectionHeading';
import ProjectCard from './projects/ProjectCard';
import Reveal from './Reveal';

export default function Projects() {
  return (
    <section id="projects" aria-labelledby="projects-title" className="scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="04 — Featured Projects" title="Selected work" id="projects-title">
            <p>
              Project screenshots and repository links are placeholders until they are ready to publish. No metrics or
              business results are claimed.
            </p>
          </SectionHeading>
        </Reveal>

        <Reveal stagger className="mt-14 grid gap-7 lg:grid-cols-2">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
