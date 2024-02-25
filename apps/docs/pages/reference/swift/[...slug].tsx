import clientLibsCommonSections from '~/spec/common-client-libs-sections.json'
import spec from '~/spec/supabase_swift_v2.yml' assert { type: 'yml' }
import RefSectionHandler from '~/components/reference/RefSectionHandler'
import { flattenSections } from '~/lib/helpers'
import handleRefGetStaticPaths from '~/lib/mdx/handleRefStaticPaths'
import { handleRefStaticProps } from '~/lib/mdx/handleRefStaticProps'
import { MenuId } from '~/components/Navigation/NavigationMenu/NavigationMenu'

const sections = flattenSections(clientLibsCommonSections)
const libraryPath = '/swift'

export default function SwiftReference(props) {
  return (
    <RefSectionHandler
      menuId={MenuId.RefSwiftV2}
      menuData={props.menuData}
      sections={sections}
      spec={spec}
      pageProps={props}
      type="client-lib"
    />
  )
}

export async function getStaticProps() {
  return handleRefStaticProps({
    sections,
    spec,
    libraryPath,
    excludedName: 'reference_swift_v2',
  })
}

export async function getStaticPaths() {
  return handleRefGetStaticPaths(sections)
}
