import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/Home";
import CreatePoint from "./pages/CreatePoint";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes> 
        <Route path="/" element={<Home />} />
        <Route path="/create-point" element={<CreatePoint />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;