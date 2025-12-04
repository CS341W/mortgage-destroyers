import { JSONFilePreset } from "lowdb/node"
import { nanoid } from "nanoid"

const initialBlogData = {
  posts: [
    {
      id: "abc12",
      title: "Getting Started with Node.js",
      author: "Sarah Johnson",
      date: "2024-01-15T14:30:00.000Z",
      html: "<p>Node.js is a powerful runtime environment that allows you to run JavaScript on the server side. In this post, we'll explore the basics of setting up your first Node.js application.</p>",
    },
    {
      id: "def34",
      title: "Understanding React Hooks",
      author: "Mike Chen",
      date: "2024-01-20T09:15:00.000Z",
      html: "<p>React Hooks have revolutionized how we write React components. Learn about useState, useEffect, and other essential hooks that will make your code cleaner and more efficient.</p>",
    },
    {
      id: "ghi56",
      title: "CSS Grid vs Flexbox",
      author: "Emily Rodriguez",
      date: "2024-01-25T16:45:00.000Z",
      html: "<p>Both CSS Grid and Flexbox are powerful layout tools, but knowing when to use each one is crucial. This guide breaks down the key differences and use cases for both.</p>",
    },
  ],
}

// Initialize the database
let db = await JSONFilePreset("dbBlog.json", initialBlogData)

async function getBlogEntries() {
  await db.read()
  return db.data.posts
}

async function addBlogEntry(blogEntry) {
  blogEntry.id = nanoid(5)
  db.data.posts.push(blogEntry)
  await db.write()
  // Return the newly added entry by finding it in the database
  return db.data.posts.find((entry) => entry.id === blogEntry.id)
}

async function deleteBlogEntry(id) {
  const index = db.data.posts.findIndex((entry) => entry.id === id)
  const deletedEntry = db.data.posts.splice(index, 1)
  await db.write()
  return deletedEntry
}

async function updateBlogEntry(id, updatedEntry) {
  const index = db.data.posts.findIndex((entry) => entry.id === id)
  if (index !== -1) {
    db.data.posts[index] = { ...db.data.posts[index], ...updatedEntry, id }
    await db.write()
    // return the updated entry
    return db.data.posts.find((entry) => entry.id === id)
  }
}

export const blogDatabase = {
  getBlogEntries,
  addBlogEntry,
  deleteBlogEntry,
  updateBlogEntry,
}
