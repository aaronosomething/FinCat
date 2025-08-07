import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import BudgetPage from "./pages/BudgetPage";
import GoalsPage from "./pages/GoalsPage";
import RetirementPage from "./pages/RetirementPage";
import InvestmentPage from "./pages/InvestmentPage";
import NetWorthPage from "./pages/NetWorthPage";
import SignupPage from "./pages/SignupPage";

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <App />,
//     children: [
//       {
//         index: true,
//         element: <HomePage />,
//       },
//       {
//         path: "login",
//         element: <LoginPage/>
//       }
//     ]
// }]);
// export default router
const getRouter = (App, mode, setMode) =>
  createBrowserRouter([
    {
      path: '/',
      element: <App mode={mode} setMode={setMode} />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'login', element: <LoginPage /> },
        { path: 'signup', element: <SignupPage/>},
        { path: 'dashboard', element: <DashboardPage/>},
        { path: 'budget', element: <BudgetPage/>},
        { path: 'invest', element: <InvestmentPage/>},
        { path: 'retire', element: <RetirementPage/>},
        { path: 'networth', element: <NetWorthPage/>},
        { path: 'goals', element: <GoalsPage/>},
      ],
    },
  ]);

export default getRouter;