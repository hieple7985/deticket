/*
  This example requires Tailwind CSS v2.0+ 
  
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  const colors = require('tailwindcss/colors')
  
  module.exports = {
    // ...
    theme: {
      extend: {
        colors: {
          rose: colors.rose,
        },
      },
    },
    plugins: [
      // ...
      require('@tailwindcss/forms'),
      require('@tailwindcss/typography'),
    ],
  }
  ```
*/
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  CollectionIcon,
  MenuAlt2Icon,
  QrcodeIcon,
  XIcon,
} from "@heroicons/react/outline";
import classNames from "classnames";
import Identicon from 'identicon.js'

const navigation = [
  // { name: 'All Issues', href: '#', icon: HomeIcon, current: true },
  { name: "My Collections", href: "#", icon: CollectionIcon, current: false },
  { name: "Validator", href: "#", icon: QrcodeIcon, current: false },
];

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // TODO: Use connected user address
  var userAvatarData = new Identicon('d3b07384d113edec49eaa6238ad5ff00', 420).toString();

  const renderUserInfo = () => (
    <div className="flex items-center px-2 py-4">
      <img src={`data:image/png;base64,${userAvatarData}`} alt="" className="w-8 h-8 rounded-full" />
      <div className="ml-4 text-sm font-medium text-white">
        <p>tz123...123</p>
        <a>Disconnect</a>
      </div>
    </div>
  );

  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-white">
        <body class="h-full">
        ```
      */}
      <div className="min-h-full flex">
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 flex z-40 lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-gray-800">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex-shrink-0 flex items-center px-4">
                  <img
                    src="/deticket-logo-white.png"
                    alt="deTicket"
                    className="h-8 w-auto"
                  />
                </div>
                <div className="mt-5 flex-1 h-0 overflow-y-auto">
                  <nav className="px-2">
                    {renderUserInfo()}
                    <div className="space-y-1">
                      {navigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            item.current
                              ? "bg-gray-900 text-white"
                              : "text-gray-300 hover:bg-gray-700 hover:text-white",
                            "group flex items-center px-2 py-2 text-base font-medium rounded-md"
                          )}
                          aria-current={item.current ? "page" : undefined}
                        >
                          <item.icon
                            className={classNames(
                              item.current
                                ? "text-gray-300"
                                : "text-gray-400 group-hover:text-gray-300",
                              "mr-4 flex-shrink-0 h-6 w-6"
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </a>
                      ))}
                    </div>
                    {/* <div className="mt-10">
                      <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Projects</p>
                      <div className="mt-2 space-y-1">
                        {projects.map((project) => (
                          <a
                            key={project.id}
                            href={project.href}
                            className="flex items-center text-gray-300 hover:bg-gray-700 hover:text-white px-2 py-2 text-base font-medium rounded-md"
                          >
                            <span className="truncate">{project.name}</span>
                          </a>
                        ))}
                      </div>
                    </div> */}
                  </nav>
                </div>
              </div>
            </Transition.Child>
            <div className="flex-shrink-0 w-14" aria-hidden="true">
              {/* Dummy element to force sidebar to shrink to fit close icon */}
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:flex lg:w-64 lg:fixed lg:inset-y-0">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-deticket-blue-dark">
              <img
                src="/deticket-logo-white.png"
                alt="deTicket"
                className="h-8 w-auto"
              />
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto bg-deticket-blue">
              <nav className="flex-1 px-2 py-4">
                {renderUserInfo()}
                <div className="space-y-1">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        item.current
                          ? "bg-[#142552] text-white"
                          : "text-gray-300 hover:bg-[#1E2F5A] hover:text-white",
                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                      )}
                      aria-current={item.current ? "page" : undefined}
                    >
                      <item.icon
                        className={classNames(
                          item.current
                            ? "text-gray-200"
                            : "text-gray-400 group-hover:text-gray-300",
                          "mr-3 flex-shrink-0 h-6 w-6"
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </a>
                  ))}
                </div>
                {/* <div className="mt-10">
                  <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Projects</p>
                  <div className="mt-2 space-y-1">
                    {projects.map((project) => (
                      <a
                        key={project.id}
                        href={project.href}
                        className="group flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:text-white hover:bg-gray-700"
                      >
                        <span className="truncate">{project.name}</span>
                      </a>
                    ))}
                  </div>
                </div> */}
              </nav>
            </div>
          </div>
        </div>

        <div className="lg:pl-64 flex flex-col w-0 flex-1">
          <div className="sticky items-center top-0 z-10 flex-shrink-0 flex h-16 bg-deticket-blue border-b md:hidden">
            <button
              type="button"
              className="px-4 text-white focus:outline-none lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <MenuAlt2Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div>
              <img
                src="/deticket-logo-white.png"
                alt="deTicket"
                className="h-8"
              />
            </div>
          </div>

          <main className="flex-1">CONTENT_HERE</main>
        </div>
      </div>
    </>
  );
};
