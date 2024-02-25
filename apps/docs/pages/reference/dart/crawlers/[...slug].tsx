import clientLibsCommonSections from '~/spec/common-client-libs-sections.json'
import typeSpec from '~/spec/enrichments/tsdoc_v2/combined.json'
import spec from '~/spec/supabase_dart_v2.yml' assert { type: 'yml' }
import RefSectionHandler from '~/components/reference/RefSectionHandler'
import { flattenSections } from '~/lib/helpers'
import handleRefGetStaticPaths from '~/lib/mdx/handleRefStaticPaths'
import { handleRefStaticProps } from '~/lib/mdx/handleRefStaticProps'
import { useRouter } from 'next/router'
import RefSEO from '~/components/reference/RefSEO'
import { MenuId } from '~/components/Navigation/NavigationMenu/NavigationMenu'

const sections = flattenSections(clientLibsCommonSections)
const libraryPath = '/dart'

export default function DartReference(props) {
  const router = useRouter()
  const slug = router.query.slug[0]
  const filteredSection = sections.filter((section) => section.slug === slug)

  const pageTitle = filteredSection[0]?.title
    ? `${filteredSection[0]?.title} | Supabase`
    : 'Supabase'

  return (
    <>
      <RefSEO title={pageTitle} />

      <RefSectionHandler
        menuId={MenuId.RefDartV2}
        menuData={props.menuData}
        sections={filteredSection}
        spec={spec}
        typeSpec={typeSpec}
        pageProps={props}
        type="client-lib"
      />
    </>
  )
}

export async function getStaticProps() {
  return handleRefStaticProps({
    sections,
    spec,
    libraryPath,
    excludedName: 'reference_dart_v2',
  })
}

export async function getStaticPaths() {
  return handleRefGetStaticPaths(sections)
}
