import { CreateEditCollectionForm } from "../../components/CreateEditCollectionForm"
import { DashboardLayout } from "../../layouts/Dashboard"

export const CollectionsNew = () => {
  return (
    <DashboardLayout>
      <div className="p-8">
        <CreateEditCollectionForm />
      </div>
    </DashboardLayout>
  )
}
