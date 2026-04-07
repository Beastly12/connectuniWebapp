import { Navigate } from 'react-router-dom'

// The ConnectUni backend uses community-based messaging rather than 1:1 DMs.
// Redirect /messages to /community.
export default function MessagesPage() {
  return <Navigate to="/community" replace />
}
