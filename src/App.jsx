import {
  BrowserRouter,
  Navigate,
  Routes,
  Route,
  useLocation
} from "react-router-dom";

import Navbar from "./components/Navbar";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import RoleRoute from "./components/RoleRoute";
import JobSeekerRoute from "./components/JobSeekerRoute";

import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import ApplyJob from "./pages/ApplyJob";
import MyApplications from "./pages/MyApplications";
import Profile from "./pages/Profile";
import SavedJobs from "./pages/SavedJobs";

import RecruiterProfile from "./pages/RecruiterProfile";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import PostJob from "./pages/PostJob";
import EditJob from "./pages/EditJob";
import RecruiterApplications from "./pages/RecruiterApplications";

import Login from "./pages/Login";
import Register from "./pages/Register";

function AppLayout() {
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {!isAuthPage && <Navbar />}

      <Routes>

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <Jobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/job/:id"
          element={
            <ProtectedRoute>
              <JobDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/job/:id/apply"
          element={
            <JobSeekerRoute>
              <ApplyJob />
            </JobSeekerRoute>
          }
        />

        <Route
          path="/applications"
          element={
            <JobSeekerRoute>
              <MyApplications />
            </JobSeekerRoute>
          }
        />

        <Route
          path="/saved-jobs"
          element={
            <JobSeekerRoute>
              <SavedJobs />
            </JobSeekerRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <JobSeekerRoute>
              <Profile />
            </JobSeekerRoute>
          }
        />

        <Route
          path="/recruiter"
          element={
            <RoleRoute allowedRole="recruiter">
              <RecruiterDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/recruiter/profile"
          element={
            <RoleRoute allowedRole="recruiter">
              <RecruiterProfile />
            </RoleRoute>
          }
        />

        <Route
          path="/post-job"
          element={
            <RoleRoute allowedRole="recruiter">
              <PostJob />
            </RoleRoute>
          }
        />

        <Route
          path="/edit-job/:id"
          element={
            <RoleRoute allowedRole="recruiter">
              <EditJob />
            </RoleRoute>
          }
        />

        <Route
          path="/recruiter/applications"
          element={
            <RoleRoute allowedRole="recruiter">
              <RecruiterApplications />
            </RoleRoute>
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;