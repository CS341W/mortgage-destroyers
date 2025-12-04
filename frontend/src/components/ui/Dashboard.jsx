import { useUser } from "@clerk/clerk-react"

function Dashboard() {
  const { user } = useUser()
  const { role } = user?.publicMetadata || null
  if (!user) return <p>Loading...</p>
  console.log("User info:", user)
  return (
    <div>
      <h1>Welcome, {user.firstName}</h1>
      <p>Your unique ID: {user.id}</p>
      <p>Email: {user.primaryEmailAddress?.emailAddress}</p>
      {!role && <p>Role: User has no "role" attribute</p>}
      {role && <p>Role: {role} </p>}
    </div>
  )
}

export default Dashboard
