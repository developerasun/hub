import { Authors, allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import AuthorLayout from '@/layouts/AuthorLayout'
import { coreContent } from 'pliny/utils/contentlayer'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: 'About' })

export default function Page() {
  const author = allAuthors.find((p) => p.slug === 'default') as Authors
  const mainContent = coreContent(author)

  return (
    <>
      <AuthorLayout content={mainContent}>
        <MDXLayoutRenderer code={author.body.code} />

        <h2 id="contact">Contact</h2>
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSe61bU-DfTyI3QaBpCT9YFFfnOTl3ER4jJ-JWQ9_hXcNSjnKQ/viewform?embedded=true"
          width="100%"
          height="1398"
          frameBorder="0"
          marginHeight={0}
          marginWidth={0}
        >
          loading
        </iframe>
      </AuthorLayout>
    </>
  )
}
