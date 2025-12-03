import * as React from "react";
import { createHashRouter, RouterProvider, Outlet } from "react-router-dom";

import Layout from "./components/layout/layout";
import Landingpage from "./components/landingpage/landingpagefull";
import ListingPage from "./components/Pages/ListingPage/Index";
import DetailPage from "./components/Pages/DetailPage/Index";

export default function AppRouter() {

  const routes: any[] = [
    {
      element: (
        <Layout>
          <Outlet />
        </Layout>
      ),
      children: [
        // Landing page
        { path: "/", element: <Landingpage/> },

        // Listing page (View All button goes here)
        { path: "listing/:listName", element: <ListingPage /> },

        // Detail page (single item details)
        { path: "detail/:listName/:id", element: <DetailPage /> }
      ],
    },
  ];

  const router = createHashRouter(routes);

  return <RouterProvider router={router} />;
}
