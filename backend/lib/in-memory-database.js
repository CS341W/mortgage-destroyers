import { nanoid } from "nanoid"
const users = [
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
]

async function getUsers() {
  return users
}

async function addUser(user) {
  user.id = nanoid(5)
  users.push(user)
}

async function removeUser(id) {
  const index = users.findIndex((user) => user.id === id)
  users.splice(index, 1)
}

async function favoriteUser(id) {
  const index = users.findIndex((user) => user.id === id)
  users[index].isFavorite = !users[index].isFavorite
}

export const database = {
  getUsers,
  addUser,
  removeUser,
  favoriteUser,
}
