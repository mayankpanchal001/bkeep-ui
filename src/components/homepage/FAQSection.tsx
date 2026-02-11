import { FAQ_ITEMS } from './constants.tsx';

const FAQSection = () => {
    return (
        <section id="faq" className="mx-auto max-w-5xl px-6 pb-20">
            <div className="flex flex-col gap-4 text-center">
                <p className="text-xs font-medium uppercase tracking-[0.45em] text-muted-foreground">
                    FAQ
                </p>
                <h2 className="text-3xl font-medium text-foreground sm:text-4xl">
                    Answers for every stage of your journey.
                </h2>
            </div>
            <div className="mt-10 flex flex-col gap-4">
                {FAQ_ITEMS.map((item) => (
                    <details
                        key={item.question}
                        className="group rounded border border-border bg-background p-5"
                    >
                        <summary className="flex cursor-pointer items-center justify-between text-left text-base font-medium text-foreground">
                            {item.question}
                            <span className="text-muted-foreground transition group-open:rotate-45">
                                +
                            </span>
                        </summary>
                        <p className="mt-3 text-sm text-muted-foreground">
                            {item.answer}
                        </p>
                    </details>
                ))}
            </div>
        </section>
    );
};

export default FAQSection;
