/// <reference path="./basehub-types.d.ts" />
import { basehub as basehubClient } from "basehub";
import type { RichTextNode, RichTextTocNode } from "basehub/react-rich-text";
import { keys } from "./keys";
import "./basehub.config";

const { BASEHUB_TOKEN } = keys();
export const isCMSConfigured = Boolean(BASEHUB_TOKEN);

const basehub = isCMSConfigured
  ? basehubClient({ token: BASEHUB_TOKEN })
  : undefined;

/* -------------------------------------------------------------------------------------------------
 * Common Fragments
 * -----------------------------------------------------------------------------------------------*/

const imageFragment = {
  url: true,
  width: true,
  height: true,
  alt: true,
  blurDataURL: true,
} as const;

export interface CMSImage {
  alt: string | null;
  blurDataURL: string;
  height: number;
  url: string;
  width: number;
}

interface Author {
  _title: string;
  avatar: CMSImage | null;
  xUrl: string | null;
}

interface Category {
  _title: string;
}

interface CMSBody {
  json: {
    content: RichTextNode[] | undefined;
    toc: RichTextTocNode[] | undefined;
  };
  plainText: string;
  readingTime: number;
}

/* -------------------------------------------------------------------------------------------------
 * Blog Fragments & Queries
 * -----------------------------------------------------------------------------------------------*/

const postMetaFragment = {
  _slug: true,
  _title: true,
  authors: {
    _title: true,
    avatar: imageFragment,
    xUrl: true,
  },
  categories: {
    _title: true,
  },
  date: true,
  description: true,
  image: imageFragment,
} as const;

const postFragment = {
  ...postMetaFragment,
  body: {
    plainText: true,
    json: {
      content: true,
      toc: true,
    },
    readingTime: true,
  },
} as const;

export interface PostMeta {
  _slug: string;
  _title: string;
  authors: Author[];
  categories: Category[];
  date: string;
  description: string;
  image: CMSImage;
}

export interface Post extends PostMeta {
  body: CMSBody;
}

interface BlogPostsResult {
  blog: {
    posts: {
      items: PostMeta[];
    };
  };
}

interface BlogPostResult {
  blog: {
    posts: {
      item: Post | null;
    };
  };
}

export const blog = {
  postsQuery: {
    blog: {
      posts: {
        items: postMetaFragment,
      },
    },
  } as const,

  latestPostQuery: {
    blog: {
      posts: {
        __args: {
          orderBy: "_sys_createdAt__DESC" as const,
        },
        item: postFragment,
      },
    },
  } as const,

  postQuery: (slug: string) => ({
    blog: {
      posts: {
        __args: {
          filter: {
            _sys_slug: { eq: slug },
          },
        },
        item: postFragment,
      },
    },
  }),

  getPosts: async (): Promise<PostMeta[]> => {
    if (!basehub) {
      return [];
    }

    try {
      const data = (await basehub.query(blog.postsQuery as never)) as BlogPostsResult;
      return data.blog.posts.items;
    } catch {
      return [];
    }
  },

  getLatestPost: async (): Promise<Post | null> => {
    if (!basehub) {
      return null;
    }

    try {
      const data = (await basehub.query(
        blog.latestPostQuery as never
      )) as BlogPostResult;
      return data.blog.posts.item;
    } catch {
      return null;
    }
  },

  getPost: async (slug: string): Promise<Post | null> => {
    if (!basehub) {
      return null;
    }

    try {
      const query = blog.postQuery(slug);
      const data = (await basehub.query(query as never)) as BlogPostResult;
      return data.blog.posts.item;
    } catch {
      return null;
    }
  },
};

/* -------------------------------------------------------------------------------------------------
 * Legal Fragments & Queries
 * -----------------------------------------------------------------------------------------------*/

const legalPostMetaFragment = {
  _slug: true,
  _title: true,
  description: true,
} as const;

const legalPostFragment = {
  ...legalPostMetaFragment,
  body: {
    plainText: true,
    json: {
      content: true,
      toc: true,
    },
    readingTime: true,
  },
} as const;

export interface LegalPostMeta {
  _slug: string;
  _title: string;
  description: string;
}

export interface LegalPost extends LegalPostMeta {
  body: CMSBody;
}

interface LegalPostsMetaResult {
  legalPages: {
    items: LegalPostMeta[];
  };
}

interface LegalPostsResult {
  legalPages: {
    items: LegalPost[];
  };
}

interface LegalPostResult {
  legalPages: {
    item: LegalPost | null;
  };
}

export const legal = {
  postsMetaQuery: {
    legalPages: {
      items: legalPostMetaFragment,
    },
  } as const,

  postsQuery: {
    legalPages: {
      items: legalPostFragment,
    },
  } as const,

  latestPostQuery: {
    legalPages: {
      __args: {
        orderBy: "_sys_createdAt__DESC" as const,
      },
      item: legalPostFragment,
    },
  } as const,

  postQuery: (slug: string) => ({
    legalPages: {
      __args: {
        filter: {
          _sys_slug: { eq: slug },
        },
      },
      item: legalPostFragment,
    },
  }),

  getPostsMeta: async (): Promise<LegalPostMeta[]> => {
    if (!basehub) {
      return [];
    }

    try {
      const data = (await basehub.query(
        legal.postsMetaQuery as never
      )) as LegalPostsMetaResult;
      return data.legalPages.items;
    } catch {
      return [];
    }
  },

  getPosts: async (): Promise<LegalPost[]> => {
    if (!basehub) {
      return [];
    }

    try {
      const data = (await basehub.query(
        legal.postsQuery as never
      )) as LegalPostsResult;
      return data.legalPages.items;
    } catch {
      return [];
    }
  },

  getLatestPost: async (): Promise<LegalPost | null> => {
    if (!basehub) {
      return null;
    }

    try {
      const data = (await basehub.query(
        legal.latestPostQuery as never
      )) as LegalPostResult;
      return data.legalPages.item;
    } catch {
      return null;
    }
  },

  getPost: async (slug: string): Promise<LegalPost | null> => {
    if (!basehub) {
      return null;
    }

    try {
      const query = legal.postQuery(slug);
      const data = (await basehub.query(query as never)) as LegalPostResult;
      return data.legalPages.item;
    } catch {
      return null;
    }
  },
};
