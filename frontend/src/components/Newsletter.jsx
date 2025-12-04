import NewsletterSignup from "./ui/NewsletterSignup"

const Newsletter = () => {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <div className="bg-gray-50 p-8 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Join the Journey
          </h2>
          <p className="text-gray-600 mb-6">
            Stay updated with my latest posts and coding adventures. Get
            insights, tutorials, and behind-the-scenes content delivered
            directly to your inbox.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              Web Development
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              React
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
              Node.js
            </span>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
              Best Practices
            </span>
          </div>
        </div>
      </div>
      <div>
        <NewsletterSignup />
      </div>
    </div>
  )
}

export default Newsletter
