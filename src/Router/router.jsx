import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import { pagesRoute, posRoutes, publicRoutes } from "./router.link";
import { all_routes } from "../Router/all_routes"; // wherever your all_routes lives

import PosLayout from "./posLayout";
import AuthPages from "./authPages";
import HeaderLayouts from "./headerLayout";

// 👇 add these imports
import { RequireAuth, GuestOnly } from "../Router/AuthGuard";
// import your SignIn page component explicitly
import SigninThree from "../../src/feature-module/pages/login/signinThree"; // <-- adjust path to your signin component

const AllRoutes = () => {
  return (
    <Routes>
      {/* /signin stays open for guests only */}
      <Route element={<GuestOnly />}>
        <Route path={all_routes.signinthree} element={<SigninThree />} />
      </Route>

      {/* Everything else requires auth */}
      <Route element={<RequireAuth />}>
        <Route element={<HeaderLayouts />}>
          {publicRoutes.map((route, id) => (
            <Route path={route.path} element={route.element} key={id} />
          ))}
        </Route>

        <Route element={<PosLayout />}>
          {posRoutes.map((route, id) => (
            <Route path={route.path} element={route.element} key={id} />
          ))}
        </Route>

        <Route element={<AuthPages />}>
          {pagesRoute.map((route, id) => (
            <Route path={route.path} element={route.element} key={id} />
          ))}
        </Route>
      </Route>

      {/* Default + catch-all: unauthed users get bounced to /signin */}
      <Route path="/" element={<Navigate to={all_routes.signinthree} replace />} />
      <Route path="*" element={<Navigate to={all_routes.signinthree} replace />} />
    </Routes>
  );
};

export default AllRoutes;
