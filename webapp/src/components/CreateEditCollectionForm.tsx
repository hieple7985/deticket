import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDeTicketContract } from "../hooks/useContract"
import { useGlobalLoading } from "../hooks/useLoading"
import { TezosAmountInput } from "./TezosAmountInput"

export const CreateEditCollectionForm = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const { setLoading } = useGlobalLoading()
  const contract = useDeTicketContract()
  const onSubmit = async () => {
    setLoading(true)
    try {
      if (!contract) {
        return
      }
      // Create or Edit here
      const amountNumber = Math.round(parseFloat(amount) * 1000)
      const res = await contract?.methods.create_ticket_collection(name, amountNumber).send()
      await res.confirmation(1)
      const s = await contract?.storage<{ ticket_collections: any, last_ticket_collection_id: any }>()
      const lastTicketNumber = s.last_ticket_collection_id.toNumber()
      // TODO: Use a better approach to get the created collection id
      const collectionId = lastTicketNumber - 1;
      navigate(`/dashboard/collections/${collectionId}`)
    } catch (error) {
      console.log(error);
    }
    setLoading(false)
  }
  return (
    <form className="space-y-8 divide-y divide-gray-200">
      <div className="space-y-8 divide-y divide-gray-200">
        <div>
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Create Collection
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              This information will be displayed publicly so be careful what you share.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* <div className="sm:col-span-6">
              <label htmlFor="about" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="mt-1">
                <textarea
                  rows={3}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                  defaultValue={''}
                />
              </div>
            </div> */}

            <div className="sm:col-span-6">
              <label htmlFor="about" className="block text-sm font-medium text-gray-700">
                Tezos Amount
              </label>
              <div className="mt-1">
                <TezosAmountInput
                  value={amount}
                  onChange={(e: any) => setAmount(e.target.value)}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                per ticket unit
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="button"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSubmit()}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  )
}
