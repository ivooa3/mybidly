import { OfferForm } from '@/components/OfferForm'

export default function NewOfferPage() {
  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Offer</h1>
          <p className="text-gray-600 mt-2">
            Set up a new product offer for your customers to bid on
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          <OfferForm />
        </div>
      </div>
    </div>
  )
}
