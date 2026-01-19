import { TESTIMONIALS } from './constants.tsx';

const TestimonialsSection = () => {
    return (
        <section id="testimonials" className="mx-auto max-w-6xl px-6 py-20">
            <div className="flex flex-col gap-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.45em] text-muted-foreground">
                    Trusted by investors worldwide
                </p>
                <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                    Real stories from forward-thinking leaders.
                </h2>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-2">
                {TESTIMONIALS.map((testimonial, index) => (
                    <div
                        key={`${testimonial.name}-${index}`}
                        className="rounded-3xl border border-border bg-background p-4 text-left"
                    >
                        <p className="text-sm text-muted-foreground">
                            “{testimonial.quote}”
                        </p>
                        <div className="mt-4 text-sm text-muted-foreground">
                            <p className="font-semibold text-foreground">
                                {testimonial.name}
                            </p>
                            <p>{testimonial.role}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default TestimonialsSection;
