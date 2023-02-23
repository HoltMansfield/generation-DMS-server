import axios from 'axios'

export const getClient = () => {
  const { BASE_URL, API_KEY } = process.env

  const client = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'api-key': API_KEY
    }
  })

  return client
}
