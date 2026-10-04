import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { SearchPage } from './pages/SearchPage';
import { SeatSelectionPage } from './pages/SeatSelectionPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { TicketPage } from './pages/TicketPage';
import { PassengerHub } from './pages/PassengerHub';
import { IntelligencePage } from './pages/IntelligencePage';
import { SafetyPage } from './pages/SafetyPage';
import { FamilyTrackPage } from './pages/FamilyTrackPage';
import { AdminCenter } from './pages/AdminCenter';
import { OperatorCenter } from './pages/OperatorCenter';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { VoicePlannerModal } from './components/VoicePlannerModal';
import { AiAssistantWidget } from './components/AiAssistantWidget';

export function App() {
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  return (
    <AuthProvider>
      <AccessibilityProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-[#101114] text-gray-100 flex flex-col font-sans">
            
            {/* Main Top Navigation */}
            <Navbar onOpenVoiceModal={() => setIsVoiceModalOpen(true)} />

            {/* Core Routes */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage onOpenVoiceModal={() => setIsVoiceModalOpen(true)} />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/search"
                  element={
                    <ProtectedRoute allowedRoles={['PASSENGER', 'ADMIN']}>
                      <SearchPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/seats/:scheduleId"
                  element={
                    <ProtectedRoute allowedRoles={['PASSENGER', 'ADMIN']}>
                      <SeatSelectionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute allowedRoles={['PASSENGER', 'ADMIN']}>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tickets/:bookingId"
                  element={
                    <ProtectedRoute allowedRoles={['PASSENGER', 'ADMIN']}>
                      <TicketPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['PASSENGER', 'ADMIN']}>
                      <PassengerHub />
                    </ProtectedRoute>
                  }
                />
                <Route path="/app" element={<Navigate to="/dashboard" replace />} />
                <Route path="/app/*" element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="/intelligence"
                  element={
                    <ProtectedRoute allowedRoles={['PASSENGER', 'ADMIN']}>
                      <IntelligencePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/safety"
                  element={
                    <ProtectedRoute allowedRoles={['PASSENGER', 'ADMIN']}>
                      <SafetyPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/track/:token" element={<FamilyTrackPage />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminCenter />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/operator"
                  element={
                    <ProtectedRoute allowedRoles={['OPERATOR', 'ADMIN']}>
                      <OperatorCenter />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Bottom Footer */}
            <Footer />

            {/* Voice-to-Journey Modal */}
            <VoicePlannerModal
              isOpen={isVoiceModalOpen}
              onClose={() => setIsVoiceModalOpen(false)}
            />

            {/* Floating AI Travel Assistant */}
            <AiAssistantWidget />

          </div>
        </BrowserRouter>
      </AccessibilityProvider>
    </AuthProvider>
  );
}

export default App;
