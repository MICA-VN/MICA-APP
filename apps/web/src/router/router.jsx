import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Tools from "../pages/Tools";
import CanBang from "../pages/CanBang";
import Periodic from "../pages/Periodic";

export const routes = [
  {
    path: "/",
    title: "Hóa Học Tương Tác",
    parent: null,
    element: <Home />
  },
  {
    path: "/periodic",
    title: "Bảng Tuần Hoàn",
    parent: "/",
    element: <Periodic />
  },
  {
    path: "/tools",
    title: "Công Cụ Hóa Học",
    parent: "/",
    element: <Tools />
  },
  {
    path: "/tools/canbang",
    title: "Cân Bằng PTHH",
    parent: "/tools",
    element: <CanBang />
  }
];

export function AppRouter() {
  return (
    <Routes>
      {routes.map(route => (
        <Route
          key={route.path}
          path={route.path}
          element={route.element}
        />
      ))}
    </Routes>
  );
}