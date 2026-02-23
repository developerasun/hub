import { NewsletterAPI } from 'pliny/newsletter'
import siteMetadata from '@/data/siteMetadata'

export const dynamic = 'force-static'

const isEnabled = siteMetadata.newsletter

const handler = isEnabled
  ? NewsletterAPI({
      // @ts-ignore
      provider: siteMetadata.newsletter.provider,
    })
  : () => Response.json('ok')

export { handler as GET, handler as POST }
