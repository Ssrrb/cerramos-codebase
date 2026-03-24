import type { ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

type MdxContentProps = {
  source: string;
};

function Anchor(props: ComponentPropsWithoutRef<"a">) {
  const href = props.href ?? "";

  if (href.startsWith("/")) {
    return (
      <Link
        href={href}
        className="font-medium text-accent-strong underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent"
      >
        {props.children}
      </Link>
    );
  }

  return (
    <a
      {...props}
      className="font-medium text-accent-strong underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent"
      target={href.startsWith("http") || href.startsWith("file:") ? "_blank" : undefined}
      rel={
        href.startsWith("http") || href.startsWith("file:")
          ? "noreferrer noopener"
          : undefined
      }
    />
  );
}

export function MdxContent({ source }: MdxContentProps) {
  return (
    <div className="prose-docs">
      <MDXRemote
        source={source}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
          },
        }}
        components={{
          a: Anchor,
          blockquote: (props) => (
            <blockquote
              {...props}
              className="my-6 rounded-2xl border border-line bg-accent-soft/45 px-5 py-4 text-base"
            />
          ),
          code: (props) => (
            <code
              {...props}
              className="rounded-md bg-[rgba(39,29,17,0.07)] px-1.5 py-0.5 text-[0.92em]"
            />
          ),
          pre: (props) => <pre {...props} />,
          hr: () => <hr />,
        }}
      />
    </div>
  );
}
