import { JSONFilePreset } from "lowdb/node"
import { nanoid } from "nanoid"

const initialData = {
  users: [
    {
      _csrf: "sSNAzhZh-csARwTjj10u8ghEOpgqkTZdOW64",
      fname: "Mark",
      lname: "Montoya",
      portrait_img: "fc730c501970ba38832ca14974c76357.jpg",
      id: "JEbxp",
      isFavorite: false,
    },
    {
      _csrf: "yglP5OtG-Xar1Ts-VHum9XcINBiw0bKVJTlY",
      fname: "Lily Jo",
      lname: "Canine",
      portrait_img: "7c8792a753fc06f10e3daf68eab0a8be.jpeg",
      id: "eixJM",
    },
  ],
}

// Initialize the database
let db = await JSONFilePreset("db.json", initialData)

async function getUsers() {
  await db.read()
  return db.data.users
}

async function addUser(user) {
  user.id = nanoid(5)
  db.data.users.push(user)
  await db.write()
}

async function removeUser(id) {
  const index = db.data.users.findIndex((user) => user.id === id)
  db.data.users.splice(index, 1)
  await db.write()
}

async function favoriteUser(id) {
  const index = db.data.users.findIndex((user) => user.id === id)
  db.data.users[index].isFavorite = !db.data.users[index].isFavorite
  await db.write()
}

export const database = {
  getUsers,
  addUser,
  removeUser,
  favoriteUser,
}
