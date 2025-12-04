export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">About Me</h1>
        <p className="text-lg text-gray-600">
          Developer, learner, and technology enthusiast
        </p>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Bio Section */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              My Story
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                I'm a passionate full-stack developer with a love for creating
                elegant solutions to complex problems. My journey in tech
                started with curiosity and has evolved into a deep appreciation
                for clean code, user experience, and continuous learning.
              </p>
              <p>
                When I'm not coding, you'll find me exploring new frameworks,
                contributing to open source projects, or writing about my
                discoveries in this developer journal. I believe in sharing
                knowledge and building communities around technology.
              </p>
              <p>
                This journal serves as my digital notebook where I document
                challenges, solutions, and insights from my development work.
                It's both a learning tool for me and hopefully a resource for
                fellow developers.
              </p>
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Technologies I Work With
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Frontend</h3>
                <ul className="space-y-1 text-gray-600">
                  <li>React & Next.js</li>
                  <li>TypeScript</li>
                  <li>TailwindCSS</li>
                  <li>Vite</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Backend</h3>
                <ul className="space-y-1 text-gray-600">
                  <li>Node.js & Express</li>
                  <li>PostgreSQL & MongoDB</li>
                  <li>APIs & GraphQL</li>
                  <li>Docker</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Get In Touch
            </h3>
            <div className="space-y-3">
              <a
                href="#"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <span className="mr-2">📧</span>
                Email
              </a>
              <a
                href="#"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <span className="mr-2">🐙</span>
                GitHub
              </a>
              <a
                href="#"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <span className="mr-2">💼</span>
                LinkedIn
              </a>
              <a
                href="#"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <span className="mr-2">🐦</span>
                Twitter
              </a>
            </div>
          </div>

          {/* Current Focus */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Currently Learning
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Advanced React Patterns</li>
              <li>• Serverless Architecture</li>
              <li>• Web Performance</li>
              <li>• DevOps & CI/CD</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
