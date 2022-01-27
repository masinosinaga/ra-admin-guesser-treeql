import {Admin, Error, Loading} from "react-admin"
import * as React from "react"
import {AdminProps, fetchUtils} from "ra-core"
import {createHashHistory as createHistory} from "history"
import {useSchema} from "../schema/useSchema"
import {treeqlDataProvider} from "../dataProvider"
import {guessResource} from "./ResourceGuesser"
import {safeChildren, ScaffoldSettings} from "./common"

export type ResourceGuesserProps = {
  baseApiUrl: string
  httpClient: (typeof fetchUtils.fetchJson)
  adminProps: AdminProps | any
  maxGridColumns: number
  showCode: boolean
  children?: React.ReactNode
  labelFields?: string[]
  searchableFields?: string[]
  excludedTables?: string[]
  includedTables?: string[]
}

export const AdminGuesser = (props: ResourceGuesserProps) => {
  const {tables, loading, error} = useSchema(
    props.baseApiUrl, props.httpClient, props.excludedTables, props.includedTables
  )
  const {
    adminProps,
    baseApiUrl,
    maxGridColumns,
    children,
    labelFields = ["label", "name", "title", "slug"],
    searchableFields = ["label", "name", "title", "slug", "description", "summary", "text"],
    showCode = true,
  } = props

  if (loading) return <Loading
    loadingPrimary={`Generating ${adminProps.title || 'React Admin'} UI...`}
    loadingSecondary={"Scaffolding tables and columns..."}
  />
  if (error) return <Error error={error}/>
  if (!tables || tables.length === 0) return <div>No tables found.</div>

  const scaffold: ScaffoldSettings = {
    tables,
    maxGridColumns,
    labelFields,
    searchableFields,
    showCode,
  }

  return <Admin
    {...adminProps}
    history={createHistory({basename: '/'})}
    dataProvider={treeqlDataProvider(baseApiUrl, props.httpClient, tables.map(table => table.name))}
  >
    {tables.map(
      (table, index) => guessResource({
        scaffold: {...scaffold, resourceTable: table},
        key: index
      })
    )}
    {safeChildren(children)}
  </Admin>
}
