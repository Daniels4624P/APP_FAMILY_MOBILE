import { useAuth } from "../../contexts/AuthContext"
import { Link } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"

function Home() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-notion-bg dark:bg-notion-dark">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-notion-text dark:text-notion-text-dark">
            Welcome to FAMILIA
          </CardTitle>
          <CardDescription className="text-notion-text-light dark:text-notion-text-dark">
            Manage your tasks, projects, and boost your productivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-notion-text dark:text-notion-text-dark mb-6">
            {user
              ? `Hello, ${user.name} ! What would you like to do today?`
              : "Sign in to start organizing your work and life."}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user ? (
              <>
                <Link to="/tasks">
                  <Button className="w-full bg-notion-orange hover:bg-notion-orange-dark text-white">
                    Manage Tasks
                  </Button>
                </Link>
                <Link to="/projects">
                  <Button className="w-full bg-notion-orange hover:bg-notion-orange-dark text-white">
                    View Projects
                  </Button>
                </Link>
                <Link to="/folders">
                  <Button className="w-full bg-notion-orange hover:bg-notion-orange-dark text-white">
                    Organize Folders
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button className="w-full bg-notion-orange hover:bg-notion-orange-dark text-white">
                    Check Profile
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button className="w-full bg-notion-orange hover:bg-notion-orange-dark text-white">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button className="w-full bg-notion-orange hover:bg-notion-orange-dark text-white">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Home

