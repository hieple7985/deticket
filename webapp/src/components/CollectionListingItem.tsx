export const CollectionListingItem = () => {
  const collection = {
    title: 'My Super Event',
    imageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
    type: 'Membership',
    datetime: new Date(),
  }
  return (
    <div
      key={collection.title}
      className="flex flex-col rounded-lg shadow-lg overflow-hidden"
    >
      <div className="flex-shrink-0">
        <img className="h-48 w-full object-cover" src={collection.imageUrl} alt="" />
      </div>
      <div className="flex-1 bg-white p-6 flex flex-col justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-indigo-600">
            <span className="hover:underline">
              {collection.type}
            </span>
          </p>
          <a href={""} className="block mt-2">
            <p className="text-xl font-semibold text-gray-900">{collection.title}</p>
          </a>
        </div>
          <div>
            <div className="flex space-x-1 text-sm text-gray-500">
              <time dateTime={collection.datetime.toISOString()}>{collection.datetime.toISOString()}</time>
              <span aria-hidden="true">&middot;</span>
              <span>6 PM</span>
            </div>
          </div>
      </div>
    </div>
  );
};
