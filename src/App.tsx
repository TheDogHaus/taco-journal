import { Link, Route, Routes } from 'react-router-dom'
import { FocusLayout, RootLayout, TabsLayout } from './components/Layouts'
import { EmptyState } from './components/PageHeader'
import { AuthLayout } from './features/auth/AuthLayout'
import { CreateAccountPage } from './features/auth/CreateAccountPage'
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage'
import { RequireAuth } from './features/auth/RequireAuth'
import { ResetPasswordPage } from './features/auth/ResetPasswordPage'
import { SignInPage } from './features/auth/SignInPage'
import { CapturePage } from './features/capture/CapturePage'
import { InsightsPage } from './features/insights/InsightsPage'
import { MePage } from './features/me/MePage'
import { RestaurantPage } from './features/restaurants/RestaurantPage'
import { SearchPage } from './features/search/SearchPage'
import { JournalPage } from './features/visits/JournalPage'
import { VisitDetailPage } from './features/visits/VisitDetailPage'
import { VisitFormPage } from './features/visits/VisitFormPage'

function NotFound() {
  return (
    <EmptyState emoji="🫓" title="Nothing here">
      <p>That page got folded up and eaten.</p>
      <Link to="/" className="btn btn-primary mt-5">
        Back to the journal
      </Link>
    </EmptyState>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route element={<AuthLayout />}>
          <Route path="sign-in" element={<SignInPage />} />
          <Route path="create-account" element={<CreateAccountPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
        </Route>
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<TabsLayout />}>
            <Route index element={<JournalPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="me" element={<MePage />} />
            <Route path="visit/:id" element={<VisitDetailPage />} />
            <Route path="restaurant/:id" element={<RestaurantPage />} />
          </Route>
          <Route element={<FocusLayout />}>
            <Route path="capture" element={<CapturePage />} />
            <Route path="visit/new" element={<VisitFormPage />} />
            <Route path="visit/:id/edit" element={<VisitFormPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
